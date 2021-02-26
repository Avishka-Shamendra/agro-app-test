DROP DOMAIN IF EXISTS UUID4 CASCADE;
DROP DOMAIN IF EXISTS VALID_CONTACT_NO CASCADE;

DROP TABLE IF EXISTS UserInfo CASCADE;
DROP TABLE IF EXISTS Farmer  CASCADE;
DROP TABLE IF EXISTS Buyer CASCADE;
DROP TABLE IF EXISTS Post CASCADE;
DROP TABLE IF EXISTS Complain CASCADE;
DROP TABLE IF EXISTS Buyer_Request CASCADE;
DROP TABLE IF EXISTS Post_Image CASCADE;
DROP TABLE IF EXISTS session CASCADE;

DROP TYPE IF EXISTS  Account_Type;
DROP TYPE IF EXISTS  Buyer_Request_State;
DROP TYPE IF EXISTS  Category;
DROP TYPE IF EXISTS  Post_State;
DROP TYPE IF EXISTS  District_Name;
DROP TYPE IF EXISTS  Gender_Type;


---------------------------------- ENUMS SCHEMA ------------------------------------

CREATE TYPE Account_Type As ENUM(
'admin',
'buyer',
'farmer'
);

CREATE TYPE Category AS ENUM(
'vegetable',
'fruit'
);  

CREATE TYPE Post_State AS ENUM(
'Active',
'Expired',
'Sold'
);

CREATE TYPE Gender_Type AS ENUM(
'Male',
'Female',
'Other'
);
CREATE TYPE Buyer_Request_State AS ENUM(
'New',
'Interested',
'NotInterested'
);
CREATE TYPE District_Name As ENUM(
'Anuradhapura',
'Ampara',
'Badulla',
'Batticaloa',
'Colombo',
'Galle',
'Gampaha',
'Hambantota',
'Jaffna',
'Kalutara',
'Kandy',
'Kegalle',
'Kilinochchi',
'Kurunegala',
'Mannar',
'Matale',
'Matara',
'Moneragala',
'Mullaitivu',
'Nuwara Eliya',
'Polonnaruwa',
'Puttalam',
'Ratnapura',
'Trincomalee',
'Vavuniya'
);
------------------------------------DOMAIN SCHEMA ---------------------------------------

CREATE DOMAIN UUID4 AS char(36)
CHECK (VALUE ~ '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}');

CREATE DOMAIN VALID_CONTACT_NO AS CHAR(10);


----------------------------------  FUNCTION SCHEMA  ------------------------------------

--Function to create UUID for tables
CREATE OR REPLACE FUNCTION generate_uuid4 ()
    RETURNS char( 36
)
AS $$
DECLARE
    var_uuid char(36);
BEGIN
    SELECT
        uuid_in(overlay(overlay(md5(random()::text || ':' || clock_timestamp()::text)
            PLACING '4' FROM 13)
        PLACING to_hex(floor(random() * (11 - 8 + 1) + 8)::int)::text FROM 17)::cstring) INTO var_uuid;
    RETURN var_uuid;
END
$$
LANGUAGE PLpgSQL;
---------------------------------------TABLE SCHEMA------------------------------------------------

-- user table
CREATE TABLE UserInfo (
  uid uuid4 DEFAULT generate_uuid4 (), -- auto generated
  type ACCOUNT_TYPE not null,
  email varchar(127) not null unique,
  password varchar(255) not null,
  first_name varchar(255) not null,
  last_name varchar(255) not null,
  gender Gender_Type not null,
  banned boolean DEFAULT false not null,
  joined timestamp not null DEFAULT NOW(),
  PRIMARY KEY (uid)
);

-- farmer table
CREATE TABLE Farmer (
  uid uuid4,
  nic varchar(15) not null UNIQUE,
  contact_no valid_contact_no not null,
  district district_name not null,
  address varchar(127),
  PRIMARY KEY (uid),
  FOREIGN KEY(uid) REFERENCES UserInfo(uid) ON DELETE CASCADE ON UPDATE CASCADE
);

--buyer table
CREATE TABLE Buyer (
  uid uuid4,
  nic varchar(15) not null UNIQUE,
  contact_no valid_contact_no not null,
  district district_name not null,
  PRIMARY KEY (uid),
  FOREIGN KEY(uid) REFERENCES UserInfo(uid) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Complain (
  comp_id uuid4 DEFAULT generate_uuid4 (), -- auto generated
  uid uuid4 not null,--person who the complain is about
  complainer_id uuid4 not null,-- person who is complaining
  body varchar(511) not null,-- message text
  added_on DATE not null,
  PRIMARY KEY (comp_id),
  FOREIGN KEY(uid) REFERENCES UserInfo(uid) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY(complainer_id) REFERENCES UserInfo(uid) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Post (
  post_id uuid4 DEFAULT generate_uuid4 (), -- auto generated
  farmer_id uuid4 not null,
  product_name varchar(31) not null,
  title varchar(63) not null,
  description varchar(999) not null,
  product_category Category not null,
  quantity numeric(20,2) not null,
  expected_price numeric(20,2) not null,
  available_district district_name not null,
  available_address varchar(127) not null,
  contact_no valid_contact_no not null,
  status Post_State not null DEFAULT 'Active',
  added_day DATE not null,
  exp_day DATE not null,
  img_data bool not null DEFAULT False,
  PRIMARY KEY (post_id),
  FOREIGN KEY(farmer_id) REFERENCES Farmer(uid) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Post_Image(
post_id uuid4,
img_type varchar(255),
name varchar(255),
data BYTEA,
PRIMARY KEY (post_id),
FOREIGN KEY(post_id) REFERENCES Post(post_id) ON DELETE CASCADE ON UPDATE CASCADE
);




CREATE TABLE Buyer_Request (
  req_msg_id uuid4 DEFAULT generate_uuid4 (), -- auto generated
  buyer_id uuid4 not null,
  post_id uuid4 not null,
  request_title VARCHAR(100) not null,
  description VARCHAR(999) not null,
  req_state Buyer_Request_State not null DEFAULT 'New', 
  added_on DATE not null,
  PRIMARY KEY (req_msg_id),
  FOREIGN KEY(buyer_id) REFERENCES Buyer(uid) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY(post_id) REFERENCES Post(post_id) ON DELETE CASCADE ON UPDATE CASCADE
);


------------------------------------ Session Scehma ----------------------------------------------
---------------------------------- SESSION TABLE SCHEMA -----------------------------------

CREATE TABLE "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
)
WITH (
    OIDS = FALSE
);

ALTER TABLE "session"
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");



------------------- Static Data In DB for Tests -------------------
DELETE FROM UserInfo;

INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-000000000001','test1@gmail.com','admin','$2b$10$PtqGLU4vwx03Ln6gGc32z.OpXa/uJRhNIXkVSFjeDn9grElRlpx1e','testFirstNameA','testlastNameA','Male');----password 12345 encrypted by using bcrypt
INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-000000000002','test2@gmail.com','farmer','$2b$10$PtqGLU4vwx03Ln6gGc32z.OpXa/uJRhNIXkVSFjeDn9grElRlpx1e','testFirstNameB','testlastNameB','Male');
INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-000000000003','test3@gmail.com','farmer','$2b$10$PtqGLU4vwx03Ln6gGc32z.OpXa/uJRhNIXkVSFjeDn9grElRlpx1e','testFirstNameC','testlastNameC','Male'); 
INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-000000000004','test4@gmail.com','buyer','$2b$10$PtqGLU4vwx03Ln6gGc32z.OpXa/uJRhNIXkVSFjeDn9grElRlpx1e','testFirstNameD','testlastNameD','Male');
INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-000000000005','test5@gmail.com','buyer','$2b$10$PtqGLU4vwx03Ln6gGc32z.OpXa/uJRhNIXkVSFjeDn9grElRlpx1e','testFirstNameE','testlastNameE','Male');

-- banned user insert
INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender,banned) VALUES ('00000000-0000-4000-8000-000000000006','test6@gmail.com','buyer','$2b$10$PtqGLU4vwx03Ln6gGc32z.OpXa/uJRhNIXkVSFjeDn9grElRlpx1e','testFirstName6','testlastName6','Male','true');
-- user with password 6 charactors long
INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-000000000007','test7@gmail.com','buyer','$2b$10$dJOQi73zTgi.tWOMK57yVeQOOtqCuLUcfREUKTiSMwwLUtGqK/A8K','testFirstName7','testlastName7','Male');

INSERT INTO Farmer VALUES ('00000000-0000-4000-8000-000000000002','981000200V','0777000002','Gampaha','address2');
INSERT INTO Farmer VALUES ('00000000-0000-4000-8000-000000000003','981000300V','0777000003','Colombo','address3');

INSERT INTO Buyer VALUES ('00000000-0000-4000-8000-000000000004','981000400V','0777000004','Colombo');
INSERT INTO Buyer VALUES ('00000000-0000-4000-8000-000000000005','981000500V','0777000005','Colombo');
INSERT INTO Buyer VALUES ('00000000-0000-4000-8000-000000000006','981000600V','0777000006','Colombo');
INSERT INTO Buyer VALUES ('00000000-0000-4000-8000-000000000007','981000700V','0777000007','Colombo');

INSERT INTO Post VALUES('10000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000002','Test Product 1','Test Post 1','Descriiption 1','vegetable',100,100,'Colombo','Address 1','0777100000','Active',NOW()::DATE,NOW()::DATE + INTERVAL '30 days',false);
INSERT INTO Post VALUES('20000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000002','Test Product 2','Test Post 2','Descriiption 2','vegetable',200,200,'Colombo','Address 2','0777200000','Active',NOW()::DATE,NOW()::DATE + INTERVAL '30 days',false);
INSERT INTO Post VALUES('30000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000003','Test Product 3','Test Post 3','Descriiption 3','fruit',300,300,'Kandy','Address 3','0777300000','Expired',NOW()::DATE - INTERVAL '30 days',NOW()::DATE ,false);
INSERT INTO Post VALUES('40000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000003','Test Product 4','Test Post 4','Descriiption 4','fruit',400,400,'Kandy','Address 4','0777400000','Sold',NOW()::DATE - INTERVAL '2 days',NOW()::DATE + INTERVAL '28 days' ,false);

INSERT INTO Buyer_Request  VALUES('11111111-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000000','Test Req Title 1','Test Description 1','New',NOW()::DATE);
INSERT INTO Buyer_Request  VALUES('22222222-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000000','Test Req Title 2','Test Description 2','Interested',NOW()::DATE);
INSERT INTO Buyer_Request  VALUES('33333333-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000000','Test Req Title 3','Test Description 3','New',NOW()::DATE);
INSERT INTO Buyer_Request  VALUES('44444444-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000000','Test Req Title 4','Test Description 4','NotInterested',NOW()::DATE);
INSERT INTO Buyer_Request  VALUES('55555555-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000000','Test Req Title 5','Test Description 5','Interested',NOW()::DATE);
INSERT INTO Buyer_Request  VALUES('66666666-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000004','40000000-0000-4000-8000-000000000000','Test Req Title 6','Test Description 6','NotInterested',NOW()::DATE);

INSERT INTO Complain VALUES('00000000-0000-4111-8000-000000000000','00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000003','This is the test complain 1',NOW()::DATE);
INSERT INTO Complain VALUES('00000000-0000-4222-8000-000000000000','00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000004','This is the test complain 2',NOW()::DATE);


