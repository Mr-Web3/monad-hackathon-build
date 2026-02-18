// SPDX-License-Identifier: MIT

// Website: https://www.decentralbros.io
// Twitter / X: https://x.com/DecentralBros_
// Telegram: https://t.me/decentralbros
//   ____       ____       ____        _____       ____       
// /\  _`\    /\  _`\    /\  _`\     /\  __`\    /\  _`\     
// \ \ \/\ \  \ \ \L\ \  \ \ \L\ \   \ \ \/\ \   \ \,\L\_\   
//  \ \ \ \ \  \ \  _ <'  \ \ ,  /    \ \ \ \ \   \/_\__ \   
//   \ \ \_\ \  \ \ \L\ \  \ \ \\ \    \ \ \_\ \    /\ \L\ \ 
//    \ \____/   \ \____/   \ \ \_\ \_\   \ \_____\   \ `\____\
//     \/___/     \/___/     \/_/\/ /    \/_____/    \/_____/
// 01000100 01000010 01010010 01001111 01010011

pragma solidity ^0.8.28;
/**
 * @title VWAPDemo
 * @notice Minimal “VWAP slicing” demo for Monad Blitz.
 * this is NOT a real swap executor. It simulates volume-weighted slice sizing
 * and allows slices to be executed in ANY order, potentially in parallel.
 *
 * Key demo properties:
 * - Creates an order with N slices (max 20)
 * - Precomputes variable slice sizes (50/100/150% pattern)
 * - executeSlice(orderId, sliceIndex) marks that slice as executed exactly once
 * - Uses a bitmask to prevent double execution (cheap + clean)
*/
contract VWAPDemo {
    struct Order {
        address creator;
        uint256 totalAmount;
        uint8 numSlices; // max 20
        uint8 executedSlices;
        uint256 startTime;
        bool active;
    }

    // orderId => Order
    mapping(bytes32 => Order) public orders;

    // orderId => bitmask of executed slices (bit i = 1 means executed)
    mapping(bytes32 => uint256) private executedMask;

    // orderId => sliceIndex => amount (stored as mapping(sliceId) to keep it simple)
    mapping(bytes32 => uint256) public sliceSizes;

    event OrderCreated(bytes32 indexed orderId, address indexed creator, uint256 amount, uint8 slices);
    event SliceExecuted(bytes32 indexed orderId, uint8 sliceIndex, uint256 amount, address indexed executor);
    event OrderCompleted(bytes32 indexed orderId);

    error Max20Slices();
    error InvalidSlices();
    error OrderNotActive();
    error InvalidSlice();
    error SliceAlreadyExecuted();
    error NotCreator();

    /**
     * @notice Create a new demo order.
     * @param totalAmount Arbitrary amount unit (demo). You can treat as “token units”.
     * @param numSlices 1..20
    */
    function createOrder(uint256 totalAmount, uint8 numSlices) external returns (bytes32 orderId) {
        if (numSlices == 0) revert InvalidSlices();
        if (numSlices > 20) revert Max20Slices();
        require(totalAmount > 0, "AMOUNT_ZERO");

        orderId = keccak256(abi.encodePacked(msg.sender, block.timestamp, totalAmount, numSlices));

        Order storage o = orders[orderId];
        // prevent overwriting in extremely rare collision case
        require(o.creator == address(0), "ORDER_EXISTS");

        o.creator = msg.sender;
        o.totalAmount = totalAmount;
        o.numSlices = numSlices;
        o.executedSlices = 0;
        o.startTime = block.timestamp;
        o.active = true;

        // Pre-calculate slice sizes (SIMULATED VWAP weighting)
        // Pattern: 150%, 100%, 50%, repeating
        uint256 baseSlice = totalAmount / numSlices;
        uint256 sum;
        for (uint8 i = 0; i < numSlices; i++) {
            uint256 variation = (i % 3 == 0)
                ? (baseSlice * 150) / 100
                : (i % 3 == 1)
                    ? baseSlice
                    : (baseSlice * 50) / 100;

            bytes32 sliceId = keccak256(abi.encodePacked(orderId, i));
            sliceSizes[sliceId] = variation;
            sum += variation;
        }

        // Optional: normalize last slice so sum roughly equals totalAmount
        // Keeps the demo looking consistent.
        if (sum != totalAmount) {
            uint8 last = numSlices - 1;
            bytes32 lastSliceId = keccak256(abi.encodePacked(orderId, last));
            uint256 lastAmt = sliceSizes[lastSliceId];

            if (sum > totalAmount) {
                uint256 diff = sum - totalAmount;
                sliceSizes[lastSliceId] = (diff >= lastAmt) ? 0 : (lastAmt - diff);
            } else {
                sliceSizes[lastSliceId] = lastAmt + (totalAmount - sum);
            }
        }

        emit OrderCreated(orderId, msg.sender, totalAmount, numSlices);
    }

    /**
     * @notice Execute a specific slice. This is the “parallelizable” function.
     * For a stronger Monad story, allow ANYONE to execute slices (bots/keepers),
     * not just the creator.
     *
     * If you want creator-only: uncomment the NotCreator check below.
    */
    function executeSlice(bytes32 orderId, uint8 sliceIndex) external {
        Order storage o = orders[orderId];
        if (!o.active) revert OrderNotActive();
        if (sliceIndex >= o.numSlices) revert InvalidSlice();

        // If you want creator-only execution, enable this:
        // if (o.creator != msg.sender) revert NotCreator();

        // bitmask check: prevent executing same slice twice
        uint256 bit = (1 << sliceIndex);
        if ((executedMask[orderId] & bit) != 0) revert SliceAlreadyExecuted();

        executedMask[orderId] |= bit;

        bytes32 sliceId = keccak256(abi.encodePacked(orderId, sliceIndex));
        uint256 amount = sliceSizes[sliceId];

        o.executedSlices += 1;
        emit SliceExecuted(orderId, sliceIndex, amount, msg.sender);

        if (o.executedSlices >= o.numSlices) {
            o.active = false;
            emit OrderCompleted(orderId);
        }
    }

    /**
     * @notice Helper view for UI: returns if a slice has been executed.
    */
    function isSliceExecuted(bytes32 orderId, uint8 sliceIndex) external view returns (bool) {
        Order storage o = orders[orderId];
        if (sliceIndex >= o.numSlices) return false;
        uint256 bit = (1 << sliceIndex);
        return (executedMask[orderId] & bit) != 0;
    }

    function getOrder(bytes32 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    function getExecutedMask(bytes32 orderId) external view returns (uint256) {
        return executedMask[orderId];
    }
}