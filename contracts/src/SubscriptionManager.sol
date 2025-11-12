// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract SubscriptionManager {
    struct Subscription {
        address subscriber;
        address creator;
        IERC20 token;
        uint256 amount;    // token smallest units
        uint256 period;    // seconds
        uint256 nextDue;   // unix timestamp
        bool active;
    }

    mapping(uint256 => Subscription) public subscriptions;
    uint256 public nextSubId;

    event SubscriptionCreated(uint256 subId, address subscriber, address creator, uint256 amount, uint256 period);
    event PaymentCollected(uint256 subId, address subscriber, address creator, uint256 amount, uint256 timestamp);
    event SubscriptionCancelled(uint256 subId);

    function createSubscription(address creator, IERC20 token, uint256 amount, uint256 period) external returns (uint256) {
        require(amount > 0, "amount>0");
        uint256 id = nextSubId++;
        subscriptions[id] = Subscription({
            subscriber: msg.sender,
            creator: creator,
            token: token,
            amount: amount,
            period: period,
            nextDue: block.timestamp + period,
            active: true
        });
        emit SubscriptionCreated(id, msg.sender, creator, amount, period);
        return id;
    }

    function collectPayment(uint256 subId) external {
        Subscription storage s = subscriptions[subId];
        require(s.active, "not active");
        require(block.timestamp >= s.nextDue, "not due yet");
        uint256 allowed = s.token.allowance(s.subscriber, address(this));
        require(allowed >= s.amount, "insufficient allowance");
        bool ok = s.token.transferFrom(s.subscriber, s.creator, s.amount);
        require(ok, "transfer failed");
        s.nextDue = block.timestamp + s.period;
        emit PaymentCollected(subId, s.subscriber, s.creator, s.amount, block.timestamp);
    }

    function cancelSubscription(uint256 subId) external {
        Subscription storage s = subscriptions[subId];
        require(msg.sender == s.subscriber || msg.sender == s.creator, "not authorized");
        s.active = false;
        emit SubscriptionCancelled(subId);
    }

    function updateAmount(uint256 subId, uint256 newAmount) external {
        Subscription storage s = subscriptions[subId];
        require(msg.sender == s.subscriber || msg.sender == s.creator, "not authorized");
        s.amount = newAmount;
    }
}
