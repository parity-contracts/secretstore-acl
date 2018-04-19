const Promise = require("bluebird");
const OnceTransferablePermission = artifacts.require("./OnceTransferablePermission.sol");

contract('OnceTransferablePermission', function(accounts) {
  let key1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
  let owner1 = accounts[0];
  let owner2 = accounts[1];
  let nonOwner = accounts[3];
  let zeroOwner = "0x0000000000000000000000000000000000000000";

  describe("OnceTransferablePermission", () => {
    let aclContract;

    beforeEach(() => OnceTransferablePermission.new()
      .then(_contract => aclContract = _contract)
    );

    it("should follow happy path", () => Promise
      .try(() => aclContract.createKey(key1))
      // check initial permissions for key 1
      .then(() => aclContract.checkPermissions(owner1, key1))
      .then(perm => assert.equal(true, perm))
      .then(() => aclContract.checkPermissions(owner2, key1))
      .then(perm => assert.equal(false, perm))
      .then(() => aclContract.checkPermissions(nonOwner, key1))
      .then(perm => assert.equal(false, perm))
      // transfer permission ot owner2
      .then(() => aclContract.transferPermission(key1, owner2))
      // check permissions for key 1 after transfering ownership
      .then(() => aclContract.checkPermissions(owner1, key1))
      .then(perm => assert.equal(false, perm))
      .then(() => aclContract.checkPermissions(owner2, key1))
      .then(perm => assert.equal(true, perm))
      .then(() => aclContract.checkPermissions(nonOwner, key1))
      .then(perm => assert.equal(false, perm))
    );

    it("should not allow access to key initially", () => Promise
      .try(() => aclContract.checkPermissions(owner1, key1))
      .then(perm => assert.equal(false, perm))
    );

    it("should not allow to create key twice", () => Promise
      .try(() => aclContract.createKey(key1))
      .then(() => aclContract.createKey(key1))
      .then(() => assert(false, "supposed to fail"), () => {})
    );

    it("should not allow to transfer ownership to zero-address", () => Promise
      .try(() => aclContract.createKey(key1))
      .then(() => aclContract.transferPermission(key1, zeroOwner))
      .then(() => assert(false, "supposed to fail"), () => {})
    );

    it("should not allow to transfer ownership twice", () => Promise
      .try(() => aclContract.createKey(key1))
      .then(() => aclContract.transferPermission(key1, owner2))
      .then(() => aclContract.transferPermission(key1, nonOwner, { from: owner2 }))
      .then(() => assert(false, "supposed to fail"), () => {})
    );

    it("should not allow to transfer ownership by non-owner", () => Promise
      .try(() => aclContract.createKey(key1))
      .then(() => aclContract.transferPermission(key1, owner2, { from: nonOwner }))
      .then(() => assert(false, "supposed to fail"), () => {})
    );
  });
});
