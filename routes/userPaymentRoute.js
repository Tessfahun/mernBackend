const express = require("express");
const userpayment = require("../database/Schema/userPayment");
const router = express.Router();

// Route to create a new order
router.post("/", async (req, res) => {
  const {
    requestedBy,
    phoneNumber,
    materialId,
    itemDescription,
    supplier,
    quantity,
    unitOfMeasure,
    unitPrice,
    paidAmount,
    paymentType,
    chequeNumber,
    remainingBalance,
    site,
    project,
  } = req.body;

  try {
    // ✅ 1. Check for missing required fields
    if (
      !requestedBy ||
      !phoneNumber ||
      !materialId ||
      !itemDescription ||
      !supplier ||
      !quantity ||
      !unitOfMeasure ||
      !unitPrice ||
      !paidAmount ||
      !paymentType ||
      !site ||
      !project
    ) {
      return res.status(400).json({
        error: "All fields are required.",
      });
    }
    // ✅ 2. Check if quantity and unitPrice are valid numbers
    if (
      isNaN(quantity) ||
      isNaN(unitPrice) ||
      quantity <= 0 ||
      unitPrice <= 0
    ) {
      return res.status(400).json({
        error: "Quantity and unit price must be valid positive numbers.",
      });
    }

    // ✅ 3. Calculate total price
    const totalPrice = quantity * unitPrice;

    // ✅ 4. Check that paidAmount is not greater than totalPrice
    if (paidAmount > totalPrice) {
      return res.status(400).json({
        error: "Paid amount cannot be greater than total price.",
      });
    }

    // ✅ 5. Calculate remainingBalance and check consistency
    const calculatedRemaining = totalPrice - paidAmount;

    // Check if paidAmount + remainingBalance does not equal totalPrice
    if (
      parseFloat(paidAmount) + parseFloat(remainingBalance) !==
      parseFloat(totalPrice)
    ) {
      return res.status(400).json({
        error:
          "The sum of paid amount and remaining balance must equal the total price.",
      });
    }

    // Additional check: If paidAmount equals totalPrice, remainingBalance must be 0
    if (
      parseFloat(paidAmount) === parseFloat(totalPrice) &&
      parseFloat(remainingBalance) !== 0
    ) {
      return res.status(400).json({
        error:
          "If the paid amount equals the total price, the remaining balance must be 0.",
      });
    }

    // Final check: Ensure remainingBalance is correct and consistent
    if (calculatedRemaining !== parseFloat(remainingBalance)) {
      return res.status(400).json({
        error: "Remaining balance is incorrect.",
      });
    }

    // ✅ 6. Create the new payment/order
    const newOrder = new userpayment({
      requestedBy,
      phoneNumber,
      materialId,
      itemDescription,
      supplier,
      quantity,
      unitOfMeasure,
      unitPrice,
      paidAmount,
      paymentType,
      chequeNumber,
      remainingBalance: calculatedRemaining,
      site,
      project,
      totalPrice,
    });

    // ✅ 7. Save to database
    await newOrder.save();

    return res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

// GET Route to fetch all orders (Populates 'requestedBy' to show user details)
router.get("/paid", async (req, res) => {
  try {
    const orders = await userpayment.find(); // Fetch orders without populate
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders." });
  }
});

router.put("/:orderId/approve", async (req, res) => {
  try {
    const { orderId } = req.params;

    // Fetch the order details
    const order = await userpayment.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order status to "Approved" (not Paid)
    const updatedOrder = await userpayment.findByIdAndUpdate(
      orderId,
      { status: "Approved" },
      { new: true }
    );

    console.log("Updated order:", updatedOrder); // Debugging log
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error approving order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put("/:orderId/markAsPaid", async (req, res) => {
  try {
    const { orderId } = req.params;

    // Fetch the order details
    const order = await userpayment.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // // Check if paidAmount matches the total price
    // if (
    //   order.paidAmount >= order.totalPrice ||
    //   order.paidAmount <= order.totalPrice
    // ) {
    //   return res
    //     .status(400)
    //     .json({ message: "Paid amount must be equal to total price" });
    // }

    // Update the order status to "Paid"
    const updatedOrder = await userpayment.findByIdAndUpdate(
      orderId,
      { status: "Paid" },
      { new: true }
    );

    // console.log("Updated order as Paid:", updatedOrder); // Debugging log
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error marking order as paid:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
