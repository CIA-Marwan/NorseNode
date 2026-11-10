/**
 * Norse Node
 * Copyright (c) 2026 Marwan Abdelrahman.
 * All rights reserved.
 *
 * Original source code is proprietary.
 * No permission is granted to copy, modify,
 * redistribute, sublicense, or commercially
 * exploit this software without prior written
 * authorization from the copyright holder.
 *
 * Project: Norse Node
 * Author: Marwan Abdelrahman
 */

class ChatRoom {
    constructor(name, roomId, creator, maxUsers = 25) {
        this.name = name;
        this.roomId = roomId;
        this.creator = creator;
        this.maxUsers = maxUsers;
        this.messages = [];
        this.participants = [];

        this.addParticipant(creator);
    }

    addParticipant(student) {
        if (!student) {
            return false;
        }

        const alreadyJoined = this.participants.some((member) => {
            if (member && typeof member.getUniqueCode === "function") {
                return member.getUniqueCode() === student.getUniqueCode?.();
            }
            return member === student;
        });

        if (alreadyJoined || this.participants.length >= this.maxUsers) {
            return false;
        }

        this.participants.push(student);
        return true;
    }

    removeParticipant(student) {
        const index = this.participants.indexOf(student);
        if (index === -1) {
            return false;
        }

        this.participants.splice(index, 1);
        return true;
    }

    sendMessage(student, text) {
        if (!student || !text || !String(text).trim()) {
            return null;
        }

        const message = {
            sender: student,
            text: String(text).trim(),
            timestamp: new Date().toISOString()
        };

        this.messages.push(message);
        return message;
    }

    getMessages() {
        return this.messages;
    }

    getParticipants() {
        return this.participants;
    }

    getName() {
        return this.name;
    }

    getRoomId() {
        return this.roomId;
    }

    getCreator() {
        return this.creator;
    }

    getParticipantCount() {
        return this.participants.length;
    }

    getAvailableSpaces() {
        return this.maxUsers - this.participants.length;
    }

    clearMessages() {
        this.messages = [];
    }
}

if (typeof window !== "undefined") {
    window.ChatRoom = ChatRoom;
}

class Room {
    constructor(sTime, eTime, purpose, leader, location, description, totalSeats, chatRoom = null) {
        this.purpose = purpose;
        this.leader = leader;
        this.location = location;
        this.description = description;
        this.sTime = sTime;
        this.eTime = eTime;
        this.students = [leader];
        this.length = eTime - sTime;
        this.totalSeats = totalSeats;
        this.availableSeats = Math.max(0, totalSeats - this.students.length);
        this.chatRoom = chatRoom || (
            typeof ChatRoom !== "undefined"
                ? new ChatRoom(`${purpose} Chat`, `${purpose.toLowerCase().replace(/\s+/g, "-")}-room`, leader, totalSeats)
                : null
        );
    }

    getPurpose() {
        return this.purpose;
    }

    getLeader() {
        return this.leader;
    }

    getLocation() {
        return this.location;
    }

    getFloorName() {
        if (this.location && typeof this.location.getFloorName === "function") {
            return this.location.getFloorName();
        }
        if (this.location && this.location.floorName) {
            return this.location.floorName;
        }
        if (this.location && typeof this.location.getBuilding === "function") {
            return this.location.getBuilding();
        }
        if (this.location && this.location.building) {
            return this.location.building;
        }
        return "Unknown Floor";
    }

    getDescription() {
        return this.description;
    }

    getSTime() {
        return this.sTime;
    }

    getETime() {
        return this.eTime;
    }

    getLength() {
        return this.length;
    }

    getTotalSeats() {
        return this.totalSeats;
    }

    getAvailableSeats() {
        return this.availableSeats;
    }

    getStudents() {
        return this.students;
    }

    getChatRoom() {
        return this.chatRoom;
    }

    extendTime(newETime) {
        this.eTime = newETime;
        this.length = this.eTime - this.sTime;
    }

    studentJoin(student) {
        if (this.availableSeats > 0) {
            this.students.push(student);
            this.availableSeats = this.totalSeats - this.students.length;
            return true;
        }
        return false;
    }

    studentLeave(student) {
        const index = this.students.indexOf(student);
        if (index !== -1) {
            this.students.splice(index, 1);
            this.availableSeats = this.totalSeats - this.students.length;
            return true;
        }
        return false;
    }
}

class Floor {
    constructor(plugs, monitors, projectors, nearbyFood, whiteboards, building, floorName) {
        this.plugs = plugs;
        this.monitors = monitors;
        this.projectors = projectors;
        this.nearbyFood = nearbyFood;
        this.whiteboards = whiteboards;
        this.building = building;
        this.floorName = floorName || "Floor";
    }

    getPlugs() {
        return this.plugs;
    }

    getMonitors() {
        return this.monitors;
    }

    getProjectors() {
        return this.projectors;
    }

    getNearbyFood() {
        return this.nearbyFood;
    }

    getWhiteboards() {
        return this.whiteboards;
    }

    getBuilding() {
        return this.building;
    }

    getFloorName() {
        return this.floorName;
    }

    getDisplayName() {
        return `${this.building} - ${this.floorName}`;
    }
}

class Student {
    constructor(fName, lName, uniqueCode) {
        this.fName = fName;
        this.lName = lName;
        this.uniqueCode = uniqueCode;
    }

    getFName() {
        return this.fName;
    }

    getLName() {
        return this.lName;
    }

    getUniqueCode() {
        return this.uniqueCode;
    }

    getFullName() {
        return `${this.fName} ${this.lName}`;
    }
}

const dummyStudents = [
    new Student("Ava", "Anderson", "S001"),
    new Student("Liam", "Brown", "S002"),
    new Student("Mia", "Carter", "S003"),
    new Student("Noah", "Davis", "S004"),
    new Student("Emma", "Edwards", "S005"),
    new Student("Lucas", "Flores", "S006"),
    new Student("Sophia", "Garcia", "S007"),
    new Student("Mason", "Harris", "S008"),
    new Student("Olivia", "Ingram", "S009"),
    new Student("Ethan", "Johnson", "S010"),
    new Student("Isabella", "King", "S011"),
    new Student("James", "Lee", "S012"),
    new Student("Charlotte", "Martin", "S013"),
    new Student("Benjamin", "Nelson", "S014"),
    new Student("Amelia", "Owens", "S015"),
    new Student("Henry", "Perez", "S016"),
    new Student("Harper", "Quinn", "S017"),
    new Student("Alexander", "Roberts", "S018"),
    new Student("Evelyn", "Scott", "S019"),
    new Student("Daniel", "Turner", "S020")
];

const dummyFloors = [
    new Floor(true, true, true, true, true, "Albright", "1st Floor"),
    new Floor(true, false, true, true, true, "Albright", "2nd Floor"),
    new Floor(false, true, true, false, true, "Albright", "3rd Floor"),
    new Floor(true, true, false, true, false, "Albright", "4th Floor"),
    new Floor(false, false, true, true, true, "Albright", "5th Floor"),

    new Floor(true, true, true, true, true, "Business", "1st Floor"),
    new Floor(true, false, true, true, true, "Business", "2nd Floor"),
    new Floor(false, true, true, false, true, "Business", "3rd Floor"),
    new Floor(true, true, false, true, false, "Business", "4th Floor"),
    new Floor(false, false, true, true, true, "Business", "5th Floor"),

    new Floor(true, true, true, true, true, "Science", "1st Floor"),
    new Floor(true, false, true, true, true, "Science", "2nd Floor"),
    new Floor(false, true, true, false, true, "Science", "3rd Floor"),
    new Floor(true, true, false, true, false, "Science", "4th Floor"),
    new Floor(false, false, true, true, true, "Science", "5th Floor"),

    new Floor(true, true, true, true, true, "Founders", "1st Floor"),
    new Floor(true, false, true, true, true, "Founders", "2nd Floor"),
    new Floor(false, true, true, false, true, "Founders", "3rd Floor"),
    new Floor(true, true, false, true, false, "Founders", "4th Floor"),
    new Floor(false, false, true, true, true, "Founders", "5th Floor"),

    new Floor(true, true, true, true, true, "Griffin Hall", "1st Floor"),
    new Floor(true, false, true, true, true, "Griffin Hall", "2nd Floor"),
    new Floor(false, true, true, false, true, "Griffin Hall", "3rd Floor"),
    new Floor(true, true, false, true, false, "Griffin Hall", "4th Floor"),
    new Floor(false, false, true, true, true, "Griffin Hall", "5th Floor"),

    new Floor(true, true, true, true, true, "Nunn", "1st Floor"),
    new Floor(true, false, true, true, true, "Nunn", "2nd Floor"),
    new Floor(false, true, true, false, true, "Nunn", "3rd Floor"),
    new Floor(true, true, false, true, false, "Nunn", "4th Floor"),
    new Floor(false, false, true, true, true, "Nunn", "5th Floor")
];

const dummyRooms = [
    new Room(9, 11, "CSC 230", dummyStudents[0], dummyFloors[0], "Quiet room for group review", 6),
    new Room(13, 15, "CSC 360", dummyStudents[1], dummyFloors[6], "Room for collaborative coding and design", 8)
];

for (let i = 2; i < dummyStudents.length; i++) {
    dummyRooms[0].studentJoin(dummyStudents[i]);
}

for (let i = 2; i < Math.min(dummyStudents.length, 7); i++) {
    dummyRooms[1].studentJoin(dummyStudents[i]);
}