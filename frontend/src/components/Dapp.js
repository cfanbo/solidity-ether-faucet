import React from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import TokenArtifact from "../contracts/Token.json";
import contractAddress from "../contracts/contract-address.json";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Transfer } from "./Transfer";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { NoTokensMessage } from "./NoTokensMessage";
import { Deposit } from "./Deposit";
import { Withdraw } from "./Withdraw";


// This is the default id used by the Hardhat Network
const HARDHAT_NETWORK_ID = '31337';

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance to keep it updated.
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync,  and how to send a
// transaction.
export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      tokenData: undefined,
      // The user's address and balance
      selectedAddress: undefined,
      isOwner: false,
      wallet: {
        balance: 0,
      },
      balance: 0,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };

    this._logger = undefined;
    this.state = this.initialState;
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install a wallet.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet 
          connectWallet={() => this._connectWallet()} 
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    // 监听链（网络）变化
    window.ethereum.on('chainChanged', (chainId) => {
      console.log('Chain changed to:', chainId);
    });

    // 监听连接断开
    window.ethereum.on('disconnect', (code, reason) => {
      console.log('Disconnected:', code, reason);
    });

    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component.
    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component.
    // if (!this.state.tokenData || !this.state.balance) {
    //   return <Loading />;
    // }

    // If everything is loaded, we render the application.
    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>
              用户中心
            </h1>
            <p>
              Welcome <b>{this.state.selectedAddress}</b>, you have{" "} 
              <b>
                {ethers.utils.formatEther(this.state.balance)}
              </b>
              {" "} ETH
            </p>
            <p>Wallet Amount {this.state.wallet.balance.toString()} WEI</p>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            {this.state.isOwner && (
<Deposit 
transferTokens={this._transferContractTokens} 
selfDestroy={this._selfDestroy}
pause={this._pause}
unpause={this._unpause}
updateAmount={this._updateAmount}
 />
            )}
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-12">
<Withdraw withdraw={this._withdrawTokens} defaultAddress={this.state.selectedAddress} />
          </div>
        </div>
      </div>
    );
  }

  _withdrawTokens = async (address) => {
    if (!ethers.utils.isAddress(address)) {
      alert("无效的以太坊地址");
      return;
    }
  
    try {
      console.log("contractAddress: ", this._token.address);
      console.log("Provider:", this._token.provider);

      const network = await this._token.provider.getNetwork();
      console.log("Connected network:", network.name);
      console.log("Connected network ID:", network.chainId);
      
      // 检查合约连接状态
      const signer = await this._token.signer;
      console.log("Signer address:", await signer.getAddress());

      // 检查合约余额
      const contractBalance = await this._token.provider.getBalance(this._token.address);
      console.log("Contract balance:", ethers.utils.formatEther(contractBalance));
      
      // 调用合约方法
      const tx = await this._token.sendMe();
      
      console.log("Transaction sent:", tx.hash);
      
      // 监听事件
      this._token.on("SendMe", (to, amount, event) => {
        console.log("SendMe event received:", {
          to,
          amount: ethers.utils.formatEther(amount),
          transactionHash: event.transactionHash
        });
      });
  
      // 等待交易确认
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      // 检查交易是否成功
      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
  
      return receipt;
  
    } catch (error) {
      // 更详细的错误处理
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        console.error("Gas estimation failed - contract may be reverting");
      }
      if (error.message.includes("execution reverted")) {
        const reason = error.data?.message || error.message;
        console.error("Transaction reverted:", reason);
        alert(`交易被拒绝: ${reason}`);
      } else {
        console.error("Transaction failed:", error);
        alert("交易失败，请查看控制台了解详情");
      }
      throw error;
    }
  };


   _pause = async () => {
    const tx = await this._token.pause();
    console.log("tx: ", tx);

    tx.wait().then((receipt) => {
      console.log("Transaction confirmed:", receipt);
    });
  }

  _unpause = async () => {
    const tx = await this._token.unpause();
    console.log("tx: ", tx);

    tx.wait().then((receipt) => {
      console.log("Transaction confirmed:", receipt);
    });
  }

  _selfDestroy = async () => {
    try {
      const tx = await this._token.destroy();
      console.log("tx: ", tx);
  
      tx.wait().then((receipt) => {
        console.log("Transaction confirmed:", receipt);
      });
    } catch (error) {
      if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        alert("Gas limit could not be estimated.");
      } else if (error.code === "ACTION_REJECTED") {
        alert("User rejected the transaction.");
      } else {
        alert("Error:" + error);
      }

      return;
    }
  };

  _transferContractTokens = async (amount, amountUnit) => {
    if (amount <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }
    try {
      await this._updateBalance();

      if (amountUnit === 'Ether') {
        amount = ethers.utils.parseEther(amount.toString());
      } else if (amountUnit === 'Wei') {
        amount = ethers.utils.parseUnits(amount.toString(), 'wei');
      } else if (amountUnit === 'Gwei') {
        amount = ethers.utils.parseUnits(amount.toString(), 'gwei');
      } else {
        alert("Invalid amount unit.", amountUnit);
        return;
      }
      console.log("amount: ", amount);

      const tx = await this._token.deposit({
       value: amount,
      //  gasLimit: ethers.utils.parseUnits('5000000000', 'wei') 
      });
      console.log("Transaction sent:", tx.hash);

      // 等待交易完成并获取确认信息
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      await this._updateWalletBalance();
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
    }

  };

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Once we have the address, we can initialize the application.

    // First we check the network
    this._checkNetwork();

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();

      if (newAddress === undefined) {
        return this._resetState();
      }
      
      this._initialize(newAddress);
    });

    console.log('_connectWalleted');
  }

  _updateAmount = async (amount) => {
    if (amount <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }
    console.log('_updateAmount', amount);
    const tx = await this._token.updateAmount(amount)
    tx.wait().then((receipt) => {
      console.log("Transaction confirmed:", receipt);
    });

  }

  _initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._initializeEthers();
    // this._getTokenData();
    this._startPollingData();
  }

  async _initializeEthers() {
    ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.DEBUG);
    this._logger = new ethers.utils.Logger();

    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    // Then, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    this._token = new ethers.Contract(
      contractAddress.Token,
      TokenArtifact.abi,
      this._provider.getSigner(0)
    );

    this._logger.debug(this._provider.getSigner(0));
    this._token.on("Deposit", (from, amount, event) => {
      this._logger.info(`Deposit event: from ${from}, amount ${amount}`);
    });

    this._token.on("SendMe", (to, amount, event) => {
      this._logger.info(`withdraw event: from ${to}, amount ${amount}`);
    });
  }

  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateBalance(), 1000);

    // We run it once immediately so we don't have to wait for it
    this._updateBalance();

    this._updateWalletBalance();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  async _updateWalletBalance() {
    const balance = await this._token.getContractBalance();
    const isOwner = await this._token.isOwner();
    this.setState({ isOwner, wallet: { balance } });
  }

  async _updateBalance() {
    const balance = await this._token.getMeBalance();
    this.setState({ balance });
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  async _switchChain() {
    const chainIdHex = `0x${HARDHAT_NETWORK_ID.toString(16)}`
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
    await this._initialize(this.state.selectedAddress);
  }

  // This method checks if the selected network is Localhost:8545
  _checkNetwork() {
    if (window.ethereum.networkVersion !== HARDHAT_NETWORK_ID) {
      this._switchChain();
    }
  }

   // 错误处理
   _handleError(error) {
    if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      return new Error("Gas 估算失败 - 合约可能会回滚");
    }
    if (error.message.includes("execution reverted")) {
      const reason = error.data?.message || error.message;
      return new Error(`交易被拒绝: ${reason}`);
    }
    return error;
  }
}
