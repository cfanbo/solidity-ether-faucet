# 免费的以太坊水龙头

官方提供的水龙头领取时，需要主网账户有一定的以太坊币才可以，这对一些刚刚入门的开发者有点不友好。相比 `Solana` 或 `SUI` 这些链的水龙头不需要用户持有任何代币就可以完全免费领取来说，以太坊的水龙头用户体验稍微差一些。


本项目使用 hardhat 框架开发, 成功部署合约后的链上地址保存在文件 `frontend/src/contracts/contract-address.json`。

## 功能简介

部署合约时的钱包进行登录（管理员身份），进行以下管理：
- 当前水龙头账户充值
- 用户最大提现金额
- 合约状态管理，如暂停、恢复
- 设置最大提现金额
- 合约销毁及退币


对于普通用户直接访问的水龙头，需要先登录，免费领取测试代币即可。

## 本地部署

本地运行测试网络:

```sh
npx hardhat node
```

打开中车个终端部署合约:

```sh
npx hardhat run scripts/deploy.js --network localhost
```

启动前端服务，进行合约配置，如水龙头充值等:

```sh
cd frontend
npm install
npm start
```

打开 [http://localhost:3000/](http://localhost:3000/) 。