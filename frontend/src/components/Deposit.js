import React from "react";

export function Deposit({transferTokens, selfDestroy, pause, unpause, updateAmount}) {
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function (event) {
      event.preventDefault();
      const selectedValue = this.getAttribute('data-value'); 
      document.getElementById('selectedValue').textContent = `${selectedValue}`;
    });
  });
    const depositSubmit = async () => {
        const value = document.getElementById("depositAmount").value;
        const amountUnit = document.getElementById("selectedValue").textContent;
        transferTokens(value, amountUnit);
        // document.getElementById("depositAmount-btn").disabled = true;
    }

    const _updateAmount = async () => {
        const value = document.getElementById("transferAmount").value;
        updateAmount(value);
    }

  return (
    <div>
        <div role="status">
           <h1> 充值 </h1>
          <div className="input-group mb-3">
            <input type="number" className="form-control" id="depositAmount" placeholder="Enter amount" aria-label="Text input with dropdown button" required/>
  <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="selectedValue">Ether</button>
  <ul className="dropdown-menu dropdown-menu-end">
    <li><a className="dropdown-item" href="#" data-value="Ether">Ether</a></li>
    <li><a className="dropdown-item" href="#" data-value="Gwei">Gwei</a></li>
    <li><a className="dropdown-item" href="#" data-value="Wei">Wei</a></li>
  </ul>
          </div>
          <div className="form-group">
            <input className="btn btn-primary" id="depositAmount-btn" type="button" value="Deposit" onClick={depositSubmit} />
          </div>
        </div>

      <div>
        <h1>设置转账金额</h1>
        <div className="form-group">
          <input type="number" className="form-control" id="transferAmount" placeholder="Enter amount" required/>
          </div>
          <div className="form-group">
          <button className="btn btn-primary" type="button" onClick={_updateAmount}>
          设置提现金额
        </button>
        </div>
      </div>

      <div>
        <h1>配置</h1>
        <div className="form-group">
          <button className="btn btn-danger" id="pause-btn" type="button" value="" onClick={pause} >暂停服务</button>
          <button className="btn btn-success ml-2" id="unpause-btn" type="button" value="" onClick={unpause} >恢复服务</button>
          <button type="button" className="btn btn-dark ml-2" onClick={selfDestroy} >销毁合约，并退还代币</button>
        </div>
      </div>
    </div>
  );
}
