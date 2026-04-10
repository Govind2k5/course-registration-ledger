const hre = require("hardhat");

async function main() {
    console.log("Starting deployment...");

    // Get the contract factory
    const CourseRegistration = await hre.ethers.getContractFactory("CourseRegistration");

    // Deploy the contract
    const courseRegistration = await CourseRegistration.deploy();

    // Wait for the deployment transaction to be mined
    await courseRegistration.waitForDeployment();

    // Fetch the deployed address
    const address = await courseRegistration.getAddress();

    console.log(`✅ CourseRegistration contract successfully deployed to: ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});