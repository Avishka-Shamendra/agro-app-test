DELETE FROM UserInfo;

------------------- Static Data In DB for Tests -------------------
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


