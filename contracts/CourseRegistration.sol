// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CourseRegistration {
    address public admin;
    uint256 public courseCount = 0;

    struct Course {
        uint256 id;
        string name;
        uint256 capacity;
        uint256 enrolledCount;
        bool isActive;
    }

    struct Student {
        bool isRegistered;
        uint256[] enrolledCourses;
    }

    mapping(uint256 => Course) public courses;
    mapping(address => Student) public students;
    mapping(uint256 => mapping(address => bool)) public courseEnrollments;

    event CourseAdded(uint256 courseId, string name, uint256 capacity);
    event StudentRegistered(address studentAddress);
    event Enrolled(address student, uint256 courseId);
    event Dropped(address student, uint256 courseId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyRegisteredStudent() {
        require(students[msg.sender].isRegistered, "Student is not registered");
        _;
    }

    constructor() {
        admin = msg.sender; // The deployer is the university admin
    }

    // --- ADMIN FUNCTIONS ---

    function addCourse(string memory _name, uint256 _capacity) public onlyAdmin {
        require(_capacity > 0, "Capacity must be greater than zero");
        
        courseCount++;
        courses[courseCount] = Course({
            id: courseCount,
            name: _name,
            capacity: _capacity,
            enrolledCount: 0,
            isActive: true
        });

        emit CourseAdded(courseCount, _name, _capacity);
    }

    // --- STUDENT FUNCTIONS ---

    function registerStudent() public {
        require(!students[msg.sender].isRegistered, "Student already registered");
        students[msg.sender].isRegistered = true;
        emit StudentRegistered(msg.sender);
    }

    function enroll(uint256 _courseId) public onlyRegisteredStudent {
        require(courses[_courseId].isActive, "Course does not exist or is inactive");
        require(!courseEnrollments[_courseId][msg.sender], "Already enrolled in this course");
        require(courses[_courseId].enrolledCount < courses[_courseId].capacity, "Course is at full capacity");

        // Update state
        courses[_courseId].enrolledCount++;
        courseEnrollments[_courseId][msg.sender] = true;
        students[msg.sender].enrolledCourses.push(_courseId);

        emit Enrolled(msg.sender, _courseId);
    }

    function dropCourse(uint256 _courseId) public onlyRegisteredStudent {
        require(courses[_courseId].isActive, "Course does not exist or is inactive");
        require(courseEnrollments[_courseId][msg.sender], "Not enrolled in this course");

        // Update state
        courses[_courseId].enrolledCount--;
        courseEnrollments[_courseId][msg.sender] = false;

        // Remove from student's enrolled array
        uint256[] storage studentCourses = students[msg.sender].enrolledCourses;
        for (uint256 i = 0; i < studentCourses.length; i++) {
            if (studentCourses[i] == _courseId) {
                // Swap with the last element and pop to remove efficiently
                studentCourses[i] = studentCourses[studentCourses.length - 1];
                studentCourses.pop();
                break;
            }
        }

        emit Dropped(msg.sender, _courseId);
    }

    // --- VIEW FUNCTIONS ---

    function getStudentCourses(address _student) public view returns (uint256[] memory) {
        return students[_student].enrolledCourses;
    }
    
    function getCourseDetails(uint256 _courseId) public view returns (string memory, uint256, uint256, bool) {
        Course memory c = courses[_courseId];
        return (c.name, c.capacity, c.enrolledCount, c.isActive);
    }
}