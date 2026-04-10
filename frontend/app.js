// The contract address generated from your local deployment
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// The Human-Readable ABI for our specific contract
const CONTRACT_ABI = [
    "function admin() view returns (address)",
    "function courseCount() view returns (uint256)",
    "function getCourseDetails(uint256 _courseId) view returns (string, uint256, uint256, bool)",
    "function addCourse(string _name, uint256 _capacity)",
    "function registerStudent()",
    "function enroll(uint256 _courseId)",
    "function dropCourse(uint256 _courseId)"
];

let provider;
let signer;
let contract;
let userAddress;
let adminAddress;

// DOM Elements
const connectBtn = document.getElementById('connectBtn');
const walletAddressDisplay = document.getElementById('walletAddress');
const roleStatusDisplay = document.getElementById('roleStatus');
const errorLog = document.getElementById('errorLog');
const adminPanel = document.getElementById('adminPanel');
const studentPanel = document.getElementById('studentPanel');
const coursesContainer = document.getElementById('coursesContainer');

// --- INITIALIZATION & CONNECTION ---

async function connectWallet() {
    errorLog.innerText = "";
    if (window.ethereum) {
        try {
            // Ethers v6 setup
            provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = await provider.getSigner();
            userAddress = await signer.getAddress();

            // Connect to contract
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            walletAddressDisplay.innerText = `Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
            connectBtn.style.display = 'none';

            await checkRole();
            await loadCourses();

        } catch (error) {
            console.error(error);
            errorLog.innerText = "Connection failed. Make sure MetaMask is unlocked.";
        }
    } else {
        errorLog.innerText = "MetaMask not detected. Please install the extension.";
    }
}

async function checkRole() {
    try {
        adminAddress = await contract.admin();
        if (userAddress.toLowerCase() === adminAddress.toLowerCase()) {
            roleStatusDisplay.innerText = "Role: Administrator";
            roleStatusDisplay.style.color = "#e74c3c";
            adminPanel.style.display = "block";
            studentPanel.style.display = "none";
        } else {
            roleStatusDisplay.innerText = "Role: Student";
            roleStatusDisplay.style.color = "#2ecc71";
            adminPanel.style.display = "none";
            studentPanel.style.display = "block";
        }
    } catch (error) {
        console.error("Error fetching admin status:", error);
    }
}

// --- ADMIN FUNCTIONS ---

async function addCourse() {
    const name = document.getElementById('courseName').value;
    const capacity = document.getElementById('courseCapacity').value;
    errorLog.innerText = "";

    if (!name || !capacity) {
        errorLog.innerText = "Please provide both name and capacity.";
        return;
    }

    try {
        const tx = await contract.addCourse(name, capacity);
        document.getElementById('addCourseBtn').innerText = "Processing Tx...";
        await tx.wait(); // Wait for mining
        document.getElementById('addCourseBtn').innerText = "Add Course to Ledger";
        document.getElementById('courseName').value = "";
        document.getElementById('courseCapacity').value = "";
        await loadCourses();
    } catch (error) {
        console.error(error);
        errorLog.innerText = "Transaction failed. Are you sure you are the admin?";
        document.getElementById('addCourseBtn').innerText = "Add Course to Ledger";
    }
}

// --- STUDENT FUNCTIONS ---

async function registerStudent() {
    errorLog.innerText = "";
    try {
        const tx = await contract.registerStudent();
        document.getElementById('registerStudentBtn').innerText = "Processing...";
        await tx.wait();
        document.getElementById('registerStudentBtn').innerText = "Profile Initialized ✅";
    } catch (error) {
        console.error(error);
        errorLog.innerText = "Failed. You might already be registered.";
        document.getElementById('registerStudentBtn').innerText = "Initialize Student Profile";
    }
}

async function handleEnrollment(isDropping) {
    const courseId = document.getElementById('enrollCourseId').value;
    errorLog.innerText = "";

    if (!courseId) {
        errorLog.innerText = "Please enter a Course ID.";
        return;
    }

    try {
        let tx;
        if (isDropping) {
            tx = await contract.dropCourse(courseId);
            document.getElementById('dropBtn').innerText = "Processing...";
        } else {
            tx = await contract.enroll(courseId);
            document.getElementById('enrollBtn').innerText = "Processing...";
        }

        await tx.wait();

        document.getElementById('dropBtn').innerText = "Drop Course";
        document.getElementById('enrollBtn').innerText = "Enroll in Course";
        await loadCourses();
    } catch (error) {
        console.error(error);
        errorLog.innerText = "Transaction failed. Check capacity, your registration status, or if you are already enrolled.";
        document.getElementById('dropBtn').innerText = "Drop Course";
        document.getElementById('enrollBtn').innerText = "Enroll in Course";
    }
}

// --- VIEW FUNCTIONS ---

async function loadCourses() {
    if (!contract) return;
    coursesContainer.innerHTML = "Loading ledger data...";

    try {
        const count = await contract.courseCount();
        coursesContainer.innerHTML = "";

        if (count == 0) {
            coursesContainer.innerHTML = "<p>No courses found on the ledger.</p>";
            return;
        }

        for (let i = 1; i <= count; i++) {
            const course = await contract.getCourseDetails(i);
            // course returns: [name, capacity, enrolledCount, isActive]

            const div = document.createElement('div');
            div.className = 'course-card';
            div.innerHTML = `
                <div>
                    <strong>ID: ${i} | ${course[0]}</strong><br>
                    <small>Status: ${course[3] ? "Active" : "Inactive"}</small>
                </div>
                <div>
                    Seats: <strong>${course[2]} / ${course[1]}</strong>
                </div>
            `;
            coursesContainer.appendChild(div);
        }
    } catch (error) {
        console.error("Error loading courses:", error);
        coursesContainer.innerHTML = "<p style='color:red;'>Failed to load ledger data.</p>";
    }
}

// Event Listeners
connectBtn.addEventListener('click', connectWallet);
document.getElementById('addCourseBtn').addEventListener('click', addCourse);
document.getElementById('registerStudentBtn').addEventListener('click', registerStudent);
document.getElementById('enrollBtn').addEventListener('click', () => handleEnrollment(false));
document.getElementById('dropBtn').addEventListener('click', () => handleEnrollment(true));
document.getElementById('refreshCoursesBtn').addEventListener('click', loadCourses);

// Listen for account changes in MetaMask
if (window.ethereum) {
    window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload();
    });
}