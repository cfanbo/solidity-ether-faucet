import React from "react";

export function Withdraw({ withdraw, defaultAddress }) {
  const dsubmit = async () => {
    const value = document.getElementById("receiveAddress").value;

    withdraw(value);
    // document.getElementById("depositAmount-btn").disabled = true;
  }

  return (
    <div className="container mt-3">
      <div className="input-group">
        <input
          type="text"
          id="receiveAddress"
          name="receiveAddress"
          className="form-control"
          placeholder="0x2k..."
          aria-label="Input field"
        />
        <button className="btn btn-primary" type="button" onClick={dsubmit}>
          Send Me ETH
        </button>
      </div>
      <div className="row mt-5">
        <div className="col-12">

          <div className="alert alert-primary" role="alert">
            当您提出请求时，可享受 0.01 Sepolia ETH。
          </div>
        </div>
      </div>
    </div>
  );
}
