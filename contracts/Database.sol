// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Database {

    struct User {
        uint id;
        string name;
        string email;
        address[] userfiles; // array of files owned by this user
        address[] contacts; // array of users that are contacts to this user
        bool exists; // will be set to true whenever this user is created; defaults to false
    }

    struct File {
        uint id;
        address owner; // owner of this file
        uint ownerkey; // the key to access this file within the userfiles array of the owner
        string name;
        uint size;
        string path;
        bytes32 crc;
        address[] fileusers; // array of every other user sharing this file with the owner
        bool exists; // will be set to true whenever this file is created; defaults to false
    }

    uint public usercount; // keep count of total users
    uint public filecount; // keep count of total files
    uint public maxuserid = 0; // keep track of the maximum user id
    uint public maxfileid = 0; // keep track of the maximum file id

    mapping(address => User) public users; // mapping of all user addresses to user struct instances
    mapping(address => File) public files; // mapping of all file addresses to file struct instances

    mapping(string => bool) public emails; // keep track of user emails to prevent duplicates
    mapping(string => bool) public paths; // keep track of file paths to prevent duplicates

    event FileAdded(address useraddr, address fileaddr, string name, string path);
    event UserAdded(address useraddr, uint id, string name, string email);
    event ContactAdded(address useraddr, address contactaddr);
    event ContactRemoved(address useraddr, address contactaddr);
    event FileUpdated(address fileaddr);
    event FileDeleted(address fileaddr);
    event FileShared(address fileaddr, address useraddr);
    event FileUnshared(address fileaddr);

    modifier userExists(address addr) {
        require(users[addr].exists && emails[users[addr].email], "User does not exist.");
        _;
    }

    modifier userExistsNot(address addr) {
        require(!users[addr].exists && !emails[users[addr].email], "User already exists.");
        _;
    }

    modifier fileExists(address addr) {
        require(files[addr].exists && paths[files[addr].path], "File does not exist.");
        _;
    }

    modifier fileExistsNot(address addr) {
        require(!files[addr].exists && !paths[files[addr].path], "File already exists.");
        _;
    }

    modifier fileNotShared(address fileaddr, address useraddr) {
        require(!inArray(files[fileaddr].fileusers, useraddr), "File already shared.");
        _;
    }

    modifier indexWithinRange(address[] storage arr, uint index) {
        require(index < arr.length, "Index is out of range.");
        _;
    }

    // estimated gas 221848
    function addFile(address owneraddr, address fileaddr, string memory name, string memory path, string memory filestring) public userExists(owneraddr) fileExistsNot(fileaddr) returns(bool) {
        bytes memory filebytes = bytes(filestring);
        files[fileaddr] = File(maxfileid++, owneraddr, 0, name, filebytes.length, path, keccak256(filebytes), new address[](0), true);
        files[fileaddr].ownerkey = users[owneraddr].userfiles.length;
        users[owneraddr].userfiles.push(fileaddr);
        paths[path] = true;
        filecount++;

        emit FileAdded(owneraddr, fileaddr, name, path);
        return true;
    }

    // estimated gas 137132
    function addUser(address useraddr, string memory name, string memory email) public userExistsNot(useraddr) returns(bool) {
        users[useraddr] = User(maxuserid++, name, email, new address[](0), new address[](0), true);
        emails[email] = true;
        usercount++;

        emit UserAdded(useraddr, maxuserid, name, email);
        return true;
    }

    function addContact(address useraddr, address contactaddr) public userExists(useraddr) userExists(contactaddr) returns(bool) {
        users[useraddr].contacts.push(contactaddr);
        users[contactaddr].contacts.push(useraddr);

        emit ContactAdded(useraddr, contactaddr);
        return true;
    }

    function getUserfiles(address useraddr) public userExists(useraddr) view returns(address[] memory) {
        return users[useraddr].userfiles;
    }

    function getFileusers(address fileaddr) public fileExists(fileaddr) view returns(address[] memory) {
        return files[fileaddr].fileusers;
    }

    function getContacts(address useraddr) public userExists(useraddr) view returns(address[] memory) {
        return users[useraddr].contacts;
    }

    function updateFile(address fileaddr, string memory filestring) public fileExists(fileaddr) returns(bool) {
        bytes memory filebytes = bytes(filestring);
        files[fileaddr].size = filebytes.length;
        files[fileaddr].crc = keccak256(filebytes);

        emit FileUpdated(fileaddr);
        return true;
    }

    // estimated gas 96653 actual gas 48327
    function deleteFile(address fileaddr) public fileExists(fileaddr) returns(bool) {
        address owner = files[fileaddr].owner;
        uint ownerkey = files[fileaddr].ownerkey;
        address newaddr = deleteFromArray(users[owner].userfiles, ownerkey); // results in a swap between the last index and deleted index
        files[newaddr].ownerkey = ownerkey; // owner key for this file has change due to swap done above
        delete paths[files[fileaddr].path];
        delete files[fileaddr];
        filecount--;

        emit FileDeleted(fileaddr);
        return true;
    }

    function removeContact(address useraddr, address contactaddr) public userExists(useraddr) userExists(contactaddr) returns(bool) {
        deleteFromArray(users[useraddr].contacts, contactaddr);
        deleteFromArray(users[contactaddr].contacts, useraddr);

        emit ContactRemoved(useraddr, contactaddr);
        return true;
    }

    // estimated gas 67275 actual gas 67275
    function shareFile(address fileaddr, address useraddr) public fileExists(fileaddr) userExists(useraddr) fileNotShared(fileaddr, useraddr) returns(bool) {
        files[fileaddr].fileusers.push(useraddr);
        users[files[fileaddr].owner].contacts.push(useraddr);
        users[useraddr].contacts.push(files[fileaddr].owner);

        emit FileShared(fileaddr, useraddr);
        return true;
    }

    function unshareFile(address fileaddr, address useraddr) public fileExists(fileaddr) userExists(useraddr) returns(bool) {
        deleteFromArray(files[fileaddr].fileusers, useraddr);

        emit FileUnshared(fileaddr);
        return true;
    }

    function unshareFile(address fileaddr) public fileExists(fileaddr) returns(bool) {
        files[fileaddr].fileusers = new address[](0);

        emit FileUnshared(fileaddr);
        return true;
    }

    function matchFile(address fileaddr, string memory filestring) view public fileExists(fileaddr) returns(bool) {
        return keccak256(bytes(filestring)) == files[fileaddr].crc;
    }

    function deleteFromArray(address[] storage arr, uint index) internal indexWithinRange(arr, index) returns(address) {
        arr[index] = arr[arr.length-1];
        arr.pop();
        return arr[index];
    }

    function deleteFromArray(address[] storage arr, address addr) internal {
        for(uint i = 0; i < arr.length; i++) {
            if(arr[i] == addr) {
                arr[i] = arr[arr.length-1];
                arr.pop();
                return;
            }
        }
    }

    function inArray(address[] storage arr, address addr) view internal returns(bool) {
        for(uint i = 0; i < arr.length; i++) {
            if(arr[i] == addr) {
                return true;
            }
        }
        return false;
    }
}