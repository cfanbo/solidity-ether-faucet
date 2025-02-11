// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EtherFaucetModule = buildModule("EtherFaucetModule", (m) => {
  const initialOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const myContract = m.contract("EtherFaucet", [initialOwner]);
  return { myContract };
});

export default EtherFaucetModule;
