// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    
    // 获取合约工厂
    const Token = await ethers.getContractFactory("EtherFaucet");
    console.log("Compiled contract successfully");

    // 获取 nonce
    const nonce = await ethers.provider.getTransactionCount(deployer.address, "latest");
    console.log("Current nonce:", nonce);

    // 部署合约
    console.log("Starting deployment...");
    const token = await Token.deploy(
      deployer.address,
      {
        nonce: nonce,
        // gasLimit: 3000000,
      }
    );
    
    // 等待合约部署完成
    console.log("Waiting for deployment to be mined...");
    await token.waitForDeployment();  // 使用 waitForDeployment 替代 deployTransaction.wait()
    
    // 获取合约地址
    const contractAddress = await token.getAddress();  // 使用 getAddress() 获取地址
    
    console.log("Contract deployed successfully!");
    console.log("Contract address:", contractAddress);
    
    // 验证合约已部署
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      throw new Error("Contract deployment failed - no bytecode at address");
    }

    //   // We also save the contract's artifacts and address in the frontend directory
    saveFrontendFiles(token, contractAddress);

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

function saveFrontendFiles(token, contractAddress) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Token: contractAddress }, undefined, 2)
  );

  console.log( JSON.stringify({ Token: contractAddress }, undefined, 2));

  const TokenArtifact = artifacts.readArtifactSync("EtherFaucet");

  fs.writeFileSync(
    path.join(contractsDir, "Token.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
  console.log("Frontend files saved!");
}
