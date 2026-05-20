import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("Deploying contracts to Base Sepolia...");

  const MockUSD = await ethers.getContractFactory("MockUSD");
  const mockUSD = await MockUSD.deploy();
  await mockUSD.waitForDeployment();
  console.log("MockUSD deployed to:", await mockUSD.getAddress());

  const MembershipNFT = await ethers.getContractFactory("MembershipNFT");
  const membershipNFT = await MembershipNFT.deploy("https://api.example.com/metadata/");
  await membershipNFT.waitForDeployment();
  console.log("MembershipNFT deployed to:", await membershipNFT.getAddress());

  console.log("Deployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
