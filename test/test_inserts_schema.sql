DELETE FROM UserInfo;

------------------- Static Data In DB for Tests -------------------
INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-000000000001','test1@gmail.com','admin','$2b$10$PtqGLU4vwx03Ln6gGc32z.OpXa/uJRhNIXkVSFjeDn9grElRlpx1e','testFirstName1','testlastName1','Male');----password 12345 encrypted by using bcrypt
INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-000000000002','test2@gmail.com','farmer','$2b$10$PtqGLU4vwx03Ln6gGc32z.OpXa/uJRhNIXkVSFjeDn9grElRlpx1e','testFirstName2','testlastName2','Male');
INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-000000000003','test3@gmail.com','farmer','$2b$10$PtqGLU4vwx03Ln6gGc32z.OpXa/uJRhNIXkVSFjeDn9grElRlpx1e','testFirstName3','testlastName3','Male'); 
INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-000000000004','test4@gmail.com','buyer','$2b$10$PtqGLU4vwx03Ln6gGc32z.OpXa/uJRhNIXkVSFjeDn9grElRlpx1e','testFirstName4','testlastName4','Male');
INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-000000000005','test5@gmail.com','buyer','$2b$10$PtqGLU4vwx03Ln6gGc32z.OpXa/uJRhNIXkVSFjeDn9grElRlpx1e','testFirstName5','testlastName5','Male');


INSERT INTO Farmer VALUES ('00000000-0000-4000-8000-000000000002','981000200V','0777000002','Gampaha','address2');
INSERT INTO Farmer VALUES ('00000000-0000-4000-8000-000000000003','981000300V','0777000003','Colombo','address3');

INSERT INTO Buyer VALUES ('00000000-0000-4000-8000-000000000004','981000400V','0777000004','Colombo');
INSERT INTO Buyer VALUES ('00000000-0000-4000-8000-000000000005','981000500V','0777000005','Colombo');

INSERT INTO Post VALUES('10000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000002','Test Product 1','Test Post 1','Descriiption 1','vegetable',100,100,'Colombo','Address 1','0777100000','Active',NOW()::DATE,NOW()::DATE + INTERVAL '30 days',false);
INSERT INTO Post VALUES('20000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000002','Test Product 2','Test Post 2','Descriiption 2','vegetable',100,100,'Colombo','Address 2','0777200000','Active',NOW()::DATE,NOW()::DATE + INTERVAL '30 days',false);