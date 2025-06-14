const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

router.get("/", customerController.getAllCustomers);
router.get("/search", customerController.searchCustomers);
router.get("/:policyNumber", customerController.getCustomerByPolicyNumber);
router.post("/", customerController.createCustomer);
router.put("/:policyNumber", customerController.updateCustomer);
router.delete("/:policyNumber", customerController.deleteCustomer);


module.exports = router;
