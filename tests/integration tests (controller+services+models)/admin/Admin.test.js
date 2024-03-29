const AdminController = require('../../../controllers/adminController');
const ComplainController = require('../../../controllers/complainsController');
const PostController = require('../../../controllers/postController');
const MessageController = require('../../../controllers/messageController');
const sql = require('../../../config/db');
let server;
describe('Admin Functionalities Integration Tests', () => {
    const res={
        render:null,
        redirect:null,
        json:null,
    };
    beforeEach(async () => {
        server = require('../../../index').server; 
        res.render= jest.fn();
        res.redirect= jest.fn();  
        res.json= jest.fn();
    });
    afterEach(async () => {
        res.render= null;
        res.redirect= null;
        res.json=null;
        await server.close();
    });
    afterAll(async()=>{
        await sql.end();
    })
    
    describe('Admin View Signup Page Functionality : AdminController signupPage Method;', () => {
        
        it('should render signup page with necessary data',()=>{
            const req={
                query:{
                    error:'test error',
                    email:'test@gmail.com',
                    firstName:'firstName',
                    lastName:'lastName',
                    gender:'Male',
                    securityKey:'qmYwp6J3yJO3TQKPaVTuUQnFGU6gCAxu'
                },
                session:{user:{uid:'00000000-0000-4000-8000-000000000001', type:'admin'}},
            }
            const expected={
                error:'test error',
                email:'test@gmail.com',
                user:{uid:'00000000-0000-4000-8000-000000000001', type:'admin'},
                firstName:'firstName',
                lastName:'lastName',
                gender:'Male',
                securityKey:'qmYwp6J3yJO3TQKPaVTuUQnFGU6gCAxu'
            }
            AdminController.signupPage(req,res);
            expect(res.render).toHaveBeenCalledWith('adminSignUp',expected);
        })
    });
    describe('Admin Signup Functionality : AdminController signup Method;', () => {
        let req;
        beforeEach(() => {
            req = {
                body:{
                    email: 'test@gmail.com',
                    password: 'test123',
                    confirmPassword: 'test123',
                    firstName:'Avishka',
                    lastName:'Shamendra',
                    gender:'Male',
                    securityKey:'qmYwp6J3yJO3TQKPaVTuUQnFGU6gCAxu'
                },
                session:{user:{uid:'00000000-0000-4000-8000-000000000001', type:'admin'},}
            }
        });
        afterEach(async() => {
            // Delete new rows added in test
            await sql`DELETE FROM userinfo WHERE email=${req.body.email}`;
        });
        it("should redirect to '/login' with success if no error", async () => {
            await AdminController.signup(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/login[?]adminRegSuccess/));
            
            
        });
        it("should redirect to '/admin/signup' with BadRequest Error if email already exist", async () => {
            
            await sql`INSERT INTO UserInfo (email, type, password, first_name,last_name,gender) 
                    VALUES ('test@gmail.com', 'admin', '#$#t6e4gryg','firstName','lastName','Male')`;

            await AdminController.signup(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[/]signup[?]error=BadRequest:  Email is already registered/));
               
        });
        it("should redirect to '/admin/signup' with Unauthorized Error if security key invalid", async () => {
            
            req.body.securityKey='qmYwp6J3yJO3TQKPaVTuUQnFGU6gCA'
            await AdminController.signup(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[/]signup[?]error=Unauthorized:  Provided Security Key Invalid/));
               
        });
        it("should redirect to '/admin/signup' with Validation Error if Joi Validation fails", async () => {
            
            req.body.email= 'test',
            await AdminController.signup(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[/]signup[?]error=ValidationError/));
               
        });
        
    });
    describe('Admin View Home Page Functionality : AdminController homePage Method;', () => {
        
        it('should render "adminHome" with error and user params',()=>{
            const req={
                query:{error:'test error'},
                session:{user:{uid:'00000000-0000-4000-8000-000000000001', type:'admin'},}
            }
            AdminController.homePage(req,res);
            expect(res.render).toHaveBeenCalledWith('adminHome',{
                error:'test error',
                user:{uid:'00000000-0000-4000-8000-000000000001', type:'admin'},
            });
        })
    });
    describe('Admin Edit Profile Functionality : AdminController editProfile Method;', () => {
        let req;
        beforeEach(() => {
            req= {
                body:{
                    firstName:'firstName',
                    lastName:'lastName',
                    gender:'Male',
                    email:'test@gmail.com',
                },
                params:{uid:'123e4567-e89b-42d3-8456-426614174000'},
                session:{user:{type:'admin',uid:'00000000-0000-4000-8000-000000000001'}},
            }
        });
        it("should redirect to '/editProfile' with success message if no error",async ()=>{
            await sql`INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) 
                    VALUES ('123e4567-e89b-42d3-8456-426614174000','test@gmail.com','admin','#$#t6e4gryg','firstName','lastName','Male')`;
            req.body.firstName='Changed First Name'        
            req.body.lastName='Changed Last Name'        
            req.body.gender='Other'        
            req.body.email='testchanged@gmail.com'        
            await AdminController.editProfile(req,res);
            await sql`DELETE FROM UserInfo WHERE uid='123e4567-e89b-42d3-8456-426614174000'`;
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/editProfile[?]success/));
            expect(req.session.user).toHaveProperty('firstName','Changed First Name'); 
            expect(req.session.user).toHaveProperty('lastName','Changed Last Name'); 
            expect(req.session.user).toHaveProperty('gender','Other'); 
            expect(req.session.user).toHaveProperty('email','testchanged@gmail.com'); 
        });
        it("should redirect to '/editProfile' with BadRequest if provided uid is not an admin",async ()=>{
            req.params.uid='1'

            await AdminController.editProfile(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/editProfile[?]error=BadRequest: No Such User Exist/));
            
        });
        it("should redirect to '/editProfile' with BadRequest if changed email is already registered",async ()=>{
            await sql`INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) 
            VALUES ('123e4567-e89b-42d3-8456-426614174000','test@gmail.com','admin','#$#t6e4gryg','firstName','lastName','Male')`;
            req.body.email='test1@gmail.com';

            await AdminController.editProfile(req,res);
            await sql`DELETE FROM UserInfo WHERE uid='123e4567-e89b-42d3-8456-426614174000'`;
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/editProfile[?]error=BadRequest: Email is already registered/));
            
        });
        it("should redirect to '/editProfile' with Validation Error if Joi Validation Fails",async()=>{
            req.body.email='test';
            await AdminController.editProfile(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/editProfile[?]error=ValidationError/));
        });
    });
    describe('Admin View all Farmers Functionality : AdminController allFarmersPage Method;', () => {
        let req;
        beforeEach(() => {
            
            req={
                query:{},
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}}
            } 
        });
        it('should render adminFarmers Page if no error',async ()=>{
            await AdminController.allFarmersPage(req,res);
            expect(res.render).toHaveBeenCalledWith('adminFarmersPage',expect.objectContaining({
                farmers: expect.arrayContaining([
                    expect.objectContaining({
                        uid:'00000000-0000-4000-8000-000000000002'
                    }),
                    expect.objectContaining({
                        uid:'00000000-0000-4000-8000-000000000003'
                    }),
                ]),
            }));
        });
        it('should redirect to admin home in case of error',async ()=>{
            req.query=null
            await AdminController.allFarmersPage(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[?]error=/));
        });
    });
    describe('Admin View all Buyers Functionality : AdminController allBuyersPage Method;', () => {
        let req;
        beforeEach(() => {
            req={
                query:{},
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}}
            } 
        });
        it('should render adminBuyers Page if no error',async ()=>{
            await AdminController.allBuyersPage(req,res);
            expect(res.render).toHaveBeenCalledWith('adminBuyersPage',expect.objectContaining({
                buyers: expect.arrayContaining([
                    expect.objectContaining({
                        uid:'00000000-0000-4000-8000-000000000004'
                    }),
                    expect.objectContaining({
                        uid:'00000000-0000-4000-8000-000000000005'
                    }),
                ]),
            }));
        });
        it('should redirect to admin home in case of error',async ()=>{
            req.query=null
            await AdminController.allBuyersPage(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[?]error=/));
        });
    });
    describe('Admin View Farmer Profile Functionality : AdminController adminSingleFarmerPage Method;', () => {
        let req;
        beforeEach(() => {
            req={
                query:{},
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}},
                params:{uid:''}
            }
        });
        it('should render adminSingleFarmerPage with farmer and posts data if no error',async ()=>{
            req.params.uid='00000000-0000-4000-8000-000000000002'
            await AdminController.adminSingleFarmerPage(req,res)
            expect(res.render).toHaveBeenCalledWith('adminSingleFarmerPage',expect.objectContaining({
                posts:expect.any(Array),
                farmer:expect.objectContaining({uid:'00000000-0000-4000-8000-000000000002'})
            }));
        })
        it('should redirect to /admin/allFarmers with error message if  given id is not a farmer',async ()=>{
            req.params.uid='test'
            await AdminController.adminSingleFarmerPage(req,res)
            expect(res.redirect).toHaveBeenCalledWith('/admin/allFarmers?error=BadRequest:  No Such Farmer');
        });
        
    });
    describe('Admin View Buyer Profile Functionality : AdminController adminSingleBuyerPage Method;', () => {
        let req;
        beforeEach(() => {
            req={
                query:{},
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}},
                params:{uid:''}
            }
        });
        it('should render adminSingleBuyerPage if no error',async ()=>{
            req.params.uid='00000000-0000-4000-8000-000000000004'
            await AdminController.adminSingleBuyerPage(req,res)
            expect(res.render).toHaveBeenCalledWith('adminSingleBuyerPage',expect.objectContaining({
                buyer:expect.objectContaining({uid:'00000000-0000-4000-8000-000000000004'})
            }));
        })
        it('should redirect to /admin/allBuyers with error message if  given id is not a buyer',async ()=>{
            req.params.uid='test'
            await AdminController.adminSingleBuyerPage(req,res)
            expect(res.redirect).toHaveBeenCalledWith('/admin/allBuyers?error=BadRequest:  No Such Buyer');
        });
        
    });
    describe('Admin Ban User Functionality : AdminController banUser Method; ', () => {
        let req;
        beforeEach(() => {
            req={
                params:{uid:''},
                url:'',
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}}
            }
        });
        it('should redirect to admin/buyer/<uid> if req url has "buyer" and ban is a success',async ()=>{
            req.params.uid='00000000-0000-4000-8000-000000000004'
            req.url='/buyer/00000000-0000-4000-8000-000000000004/ban'
            await AdminController.banUser(req,res)

            await sql`UPDATE UserInfo SET banned=${false} WHERE uid=${req.params.uid}`

            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/admin[/]buyer[/]00000000-0000-4000-8000-000000000004[?]ban_success/)
            );
        });
        it('should redirect to admin/farmer/<uid> if req url has "farmer" and ban is a success',async ()=>{
            req.params.uid='00000000-0000-4000-8000-000000000003'
            req.url='/farmer/00000000-0000-4000-8000-000000000003/ban'
            await AdminController.banUser(req,res)

            await sql`UPDATE UserInfo SET banned=${false} WHERE uid=${req.params.uid}`

            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/admin[/]farmer[/]00000000-0000-4000-8000-000000000003[?]ban_success/)
            );
        });
        it('should redirect to /admin with error if req url has an error',async ()=>{
            req.params.uid='00000000-0000-4000-8000-000000000003'
            req.url='/error_url/00000000-0000-4000-8000-000000000003/ban'
            await AdminController.banUser(req,res)

            await sql`UPDATE UserInfo SET banned=${false} WHERE uid=${req.params.uid}`

            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/admin[?]error/)
            );
        });
        it('should redirect to /admin/allBuyers if req url has "buyer" but ban failed',async ()=>{
            req.params.uid='00000000-0000-4000-8000-300000000003'
            req.url='/buyer/00000000-0000-4000-8000-300000000003/ban'
            await AdminController.banUser(req,res)

            expect.stringMatching(/admin[/]allBuyers[?]error/)
        });
        it('should redirect to /admin/allFarmers if req url has "farmer" but ban failed',async ()=>{
            req.params.uid='00000000-0000-4000-8000-300000000003'
            req.url='/farmer/00000000-0000-4000-8000-300000000003/ban'
            await AdminController.banUser(req,res)

            expect.stringMatching(/admin[/]allFarmers[?]error/)
        });
        it('should redirect to /admin if req url has error and ban failed',async ()=>{
            req.params.uid='00000000-0000-4000-8000-300000000003'
            req.url='/error_url/00000000-0000-4000-8000-300000000003/ban'
            await AdminController.banUser(req,res)
            expect.stringMatching(/admin[?]error/)
        });

    });
    describe('Admin Unban User Functionality : AdminController unbanUser Method;', () => {
        let req;
        beforeEach(() => {
            req={
                params:{uid:''},
                url:'',
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}}
            }
        });
        it('should redirect to admin/buyer/<uid> if req url has "buyer" and unban is a success',async ()=>{

            req.params.uid='00000000-0000-4000-8000-000000000004'
            req.url='/buyer/00000000-0000-4000-8000-000000000004/unban'
            await sql`UPDATE UserInfo SET banned=${true} WHERE uid=${req.params.uid}`

            await AdminController.unbanUser(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/admin[/]buyer[/]00000000-0000-4000-8000-000000000004[?]unban_success/)
            );
        });
        it('should redirect to admin/farmer/<uid> if req url has "farmer" and unban is a success',async ()=>{
            req.params.uid='00000000-0000-4000-8000-000000000003'
            req.url='/farmer/00000000-0000-4000-8000-000000000003/unban'
            await sql`UPDATE UserInfo SET banned=${true} WHERE uid=${req.params.uid}`
            await AdminController.unbanUser(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/admin[/]farmer[/]00000000-0000-4000-8000-000000000003[?]unban_success/)
            );
        });
        it('should redirect to /admin with error if req url has an error',async ()=>{
            req.params.uid='00000000-0000-4000-8000-000000000003'
            req.url='/error_url/00000000-0000-4000-8000-000000000003/unban'
            await sql`UPDATE UserInfo SET banned=${true} WHERE uid=${req.params.uid}`

            await AdminController.unbanUser(req,res)

            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/admin[?]error/)
            );
        });
        it('should redirect to /admin/allBuyers if req url has "buyer" but unban failed',async ()=>{
            req.params.uid='00000000-0000-4000-8000-300000000003'
            req.url='/buyer/00000000-0000-4000-8000-300000000003/unban'
            await AdminController.unbanUser(req,res)

            expect.stringMatching(/admin[/]allBuyers[?]error/)
        });
        it('should redirect to /admin/allFarmers if req url has "farmer" but unban failed',async ()=>{
            req.params.uid='00000000-0000-4000-8000-300000000003'
            req.url='/farmer/00000000-0000-4000-8000-300000000003/unban'
            await AdminController.unbanUser(req,res)

            expect.stringMatching(/admin[/]allFarmers[?]error/)
        });
        it('should redirect to /admin if req url has error and unban failed',async ()=>{
            req.params.uid='00000000-0000-4000-8000-300000000003'
            req.url='/error_url/00000000-0000-4000-8000-300000000003/unban'
            await AdminController.unbanUser(req,res)
            expect.stringMatching(/admin[?]error/)
        });

    });
    
    describe('Admin Delete Farmer Functionality : AdminController deleteFarmer Method;', () => {
        let req;
        beforeEach(() => {
            req={
                params:{uid:''},
                body:{
                    del_password:'12345'
                },
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}}
            }
        });
        it("should redirect to '/admin/allfarmers' with success message if no error",async ()=>{
            await sql.begin(async sql => {
                await sql`INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-111000000003','testdel@gmail.com','farmer','passworddel','testFirstNamedel','testlastNamedel','Male');`
                await sql`INSERT INTO Farmer VALUES ('00000000-0000-4000-8000-111000000003','981111300V','0777111003','Colombo','addressdel');`
              })
                req.params.uid='00000000-0000-4000-8000-111000000003'
                await AdminController.deleteFarmer(req,res);
                expect(res.redirect).toHaveBeenCalledWith('/admin/allFarmers?success=Farmer Deleted Successfully');
        })
        it("should redirect to '/admin/allfarmers' with error if admin gave the wrong password",async()=>{
            req.body.del_password='1234'
            req.params.uid='00000000-0000-4000-8000-000000000003'
            await AdminController.deleteFarmer(req,res)
            expect(res.redirect).toHaveBeenCalledWith('/admin/allFarmers?error=BadRequest: Password Entered Not Valid');
        })
        it("should redirect to '/admin/allFarmers' with error if admin gave the invalid id to delete",async()=>{
            req.params.uid='00000000-0000-4000-8000-111000000003'
            await AdminController.deleteFarmer(req,res)
            expect(res.redirect).toHaveBeenCalledWith('/admin/allFarmers?error=BadRequest: OOPS something went wrong could not delete account');
        })
    });
    describe('Admin Delete Buyer Functionality : AdminController deleteBuyer Method;', () => {
        let req;
        beforeEach(() => {
            req={
                params:{uid:''},
                body:{
                    del_password:'12345'
                },
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}}
            }
        });
        it("should redirect to '/admin/allBuyers' with success message if no error",async ()=>{
            await sql.begin(async sql => {
                await sql`INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-111000000003','testdel@gmail.com','buyer','passworddel','testFirstNamedel','testlastNamedel','Male');`
                await sql`INSERT INTO Buyer VALUES ('00000000-0000-4000-8000-111000000003','981111300V','0777111003','Colombo');`
              })
                req.params.uid='00000000-0000-4000-8000-111000000003'
                await AdminController.deleteBuyer(req,res);
                expect(res.redirect).toHaveBeenCalledWith('/admin/allBuyers?success=Buyer Deleted Successfully');
        })
        it("should redirect to '/admin/allBuyers' with error if admin gave the wrong password",async()=>{
            req.body.del_password='1234'
            req.params.uid='00000000-0000-4000-8000-000000000005'
            await AdminController.deleteBuyer(req,res)
            expect(res.redirect).toHaveBeenCalledWith('/admin/allBuyers?error=BadRequest: Password Entered Not Valid');
        })
        it("should redirect to '/admin/allBuyers' with error if admin gave the invalid id to delete",async()=>{
            req.params.uid='00000000-0000-4000-8000-111000000003'
            await AdminController.deleteBuyer(req,res)
            expect(res.redirect).toHaveBeenCalledWith('/admin/allBuyers?error=BadRequest: OOPS something went wrong could not delete account');
        })
    });
    describe('Admin View System Stats Functionality : AdminController statsPage Method;', () => {
        let req;
        beforeEach(() => {
            req={
                query:{error:{}},
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}}
            }
        });
        it('should render adminStatsPage with stats_obj as data from DB',async()=>{
            await AdminController.statsPage(req,res);
            expect(res.render).toHaveBeenCalledWith("adminStatsPage", expect.objectContaining({
                error:{},
                user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'},
                stats:expect.objectContaining({
                    num_active_posts: expect.arrayContaining([{count: 2}]),
                    num_buyer_reqs: expect.arrayContaining([{count: 6}]),
                    num_buyers: expect.arrayContaining([{count: 4}]),
                    num_complains: expect.arrayContaining([{count: 2}]),
                    num_expired_posts: expect.arrayContaining([{count: 1}]),
                    num_farmers: expect.arrayContaining([{count: 2}]),
                    num_sold_posts: expect.arrayContaining([{count: 1}])
                })
            }) );
        });
        it('should redirect to admin home in case of error',async()=>{
            req.session=null;
            await AdminController.statsPage(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/admin[?]error/));
        });
    });
    describe('Admin Search User Functionality : AdminController Search Method;', () => {
        let req;
        beforeEach(() => {
            req={
                query:{query:''},
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}}
            }
        });
        it('should return a json object with type nic and success set to true if query was made using numbers between 0-9', async () => {
            req.query.query="9"
            await AdminController.search(req,res)
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success:true,
                type:'nic',
                farmers:expect.arrayContaining([
                    expect.objectContaining({uid:'00000000-0000-4000-8000-000000000002'}),
                    expect.objectContaining({uid:'00000000-0000-4000-8000-000000000003'})
                ]),
                buyers:expect.arrayContaining([
                    expect.objectContaining({uid:'00000000-0000-4000-8000-000000000004'}),
                    expect.objectContaining({uid:'00000000-0000-4000-8000-000000000005'})
                ]),
            }));
        });
        it('should return a json object with type name and success set to true if query was made using letters not regex /[0-9]/g', async () => {
            req.query.query='testFirstNameB'
            await AdminController.search(req,res)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                type: "name",
                users: expect.arrayContaining([expect.objectContaining({uid:'00000000-0000-4000-8000-000000000002'})])
            });
        });
        it('should return a json with success false if error occurs', async () => {
            req.query=null
            await AdminController.search(req,res)
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success:false,
                error:expect.anything(),
            }));
        });
    });
    describe('Admin View Posts Functionality : Admin Controller adminPostsPage Method;', () => {
        let req;
        beforeEach(() => {
            req={
                query:{error:'',success:''},
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}}
            }
        });
        it('system should render adminPostsPage if no error', async () => {
            await AdminController.adminPostsPage(req,res)
            expect(res.render).toHaveBeenCalledWith('adminPostsPage',expect.objectContaining({
                error:expect.any(String),
                success:expect.any(String),
                user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'},
                activePosts: expect.arrayContaining([expect.objectContaining({
                    post_id:'10000000-0000-4000-8000-000000000000',
                }),expect.objectContaining({
                    post_id:'20000000-0000-4000-8000-000000000000',
                })]),
                soldPosts: expect.arrayContaining([expect.objectContaining({
                    post_id:'40000000-0000-4000-8000-000000000000',
                })]),
                expiredPosts: expect.arrayContaining([expect.objectContaining({
                    post_id:'30000000-0000-4000-8000-000000000000',
                })]),
            }));
        });
        it('system should redirect to /admin if error', async () => {
            req.query=null
            await AdminController.adminPostsPage(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/admin[?]error=/));
        });
    });
    describe('Admin Delete Post Functionality : PostController deletePostAdmin Method;', () => {
        let req;
        beforeEach(() => {
            req={
                params:{post_id:''},
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}}
            }
        });
        it('should delete the post and redirect to "/admin/allPosts" with success message', async () => {
            await sql`INSERT INTO Post VALUES('99000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000002','Test Product99','Test Post 1','Descriiption99','vegetable',100,100,'Colombo','Address99','0777100000','Active',NOW()::DATE,NOW()::DATE + INTERVAL '30 days',false)`
            req.params.post_id='99000000-0000-4000-8000-000000000000';
            await PostController.deletePostAdmin(req,res)
            const [result] = await sql`SELECT * FROM Post WHERE post_id='99000000-0000-4000-8000-000000000000'`;
            expect(res.redirect).toHaveBeenCalledWith(`/admin/allPosts?success=Post Deleted Successfully`);
            expect(result).toBeFalsy();
        });
        it('should redirect to "/admin/allPosts" with error message if req error', async () => {
            req.params=null;
           await PostController.deletePostAdmin(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[/]allPosts[?]error=/));

        });
    });
    describe('Admin Delete Post From Farmer Profile Functionality : PostController deleteFarmerPostAdmin Method;', () => {
        let req;
        beforeEach(() => {
            req={
                params:{post_id:''},
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}}
            }
        });
        it('should delete the post and redirect to "/admin/allFarmers" with success message', async () => {
            await sql`INSERT INTO Post VALUES('99000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000002','Test Product99','Test Post 1','Descriiption99','vegetable',100,100,'Colombo','Address99','0777100000','Active',NOW()::DATE,NOW()::DATE + INTERVAL '30 days',false)`
            req.params.post_id='99000000-0000-4000-8000-000000000000';
            await PostController.deleteFarmerPostAdmin(req,res)
            const [result] = await sql`SELECT * FROM Post WHERE post_id='99000000-0000-4000-8000-000000000000'`;
            expect(res.redirect).toHaveBeenCalledWith(`/admin/allFarmers?success=Post Deleted Successfully`);
            expect(result).toBeFalsy();
        });
        it('should redirect to "/admin/allFarmers" with error message if req error', async () => {
            req.params=null;
           await PostController.deleteFarmerPostAdmin(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[/]allFarmers[?]error=/));

        });
    });
    describe("Admin View All Complains Functionallity : ComplainController adminComplainsPage Method;",()=>{
        let req;
        beforeEach(async() => {
            req = {
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}},
                query:{error:"Error Checking",success:"Success Message"}
            }
        });

        it("should render adminBuyerRequestPage page if no error", async () => {
            await ComplainController.adminComplainsPage(req,res);
            expect(res.render).toHaveBeenCalledWith('adminComplainsPage',{
                error:"Error Checking",
                success:"Success Message",
                user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'},
                complains: expect.arrayContaining([expect.objectContaining({
                    comp_id:'00000000-0000-4111-8000-000000000000',
                }),expect.objectContaining({
                    comp_id:'00000000-0000-4222-8000-000000000000',
                })])
    
            });
        });

        it("should redirect to /admin with error message if request error", async () => {
            req.query=null
            await ComplainController.adminComplainsPage(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[?]error=/));   
        });
    });
    describe("Admin Delete Complain Functionality : ComplainController delete Method;",()=>{
        let req;
        beforeEach(async() => {
            req = {
                params:{comp_id:"00000000-0000-4111-8000-000000000000"},
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}}
            }
        });

        it("should redirect to /admin/complains with error message if request error", async () => {
            req.params=null
            await ComplainController.delete(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[/]complains[?]error=/));   
        });

        it("should redirect to /admin/complains with success message if no errors", async () => {
            await ComplainController.delete(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[/]complains[?]success=Complain Deleted Successfully/));
            sql`INSERT INTO Complain VALUES('00000000-0000-4111-8000-000000000000','00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000003','This is the test complain 1',NOW()::DATE);`   
        });
    });
    describe("Admin View All Buyer Messages Functionality : MessageController adminMessagesPage Method;",()=>{
        it('should render adminBuyerRequestPage with all requests if no error',async ()=>{
            const req={
                query:{error:'test error', success:'test success'},
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}},
            }
            await MessageController.adminMessagesPage(req,res);
            expect(res.render).toHaveBeenCalledWith('adminBuyerRequestPage',{
                error:"test error",
                success:'test success',
                user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'},
                requests: expect.arrayContaining([expect.objectContaining({
                    req_msg_id:'11111111-0000-4000-8000-000000000000',
                }),expect.objectContaining({
                    req_msg_id:'22222222-0000-4000-8000-000000000000',
                })])
    
            });
        })

        it('should redirect to /admin with error message in case of request error',async ()=>{
            const req={
                query:null,
            }
            await MessageController.adminMessagesPage(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[?]error=/));
        })
    })
    describe("Admin Delete Buyer Message Functionality : MessageController deleteMsgAdmin Method;",()=>{
        let req;
        beforeEach(async() => {
            req = {
                params:{req_msg_id:"11111111-0000-4000-8000-000000000000"},
                session:{user:{uid:'00000000-0000-4000-8000-000000000001',type:'admin'}}
            }
        });

        it('should redirect /admin/buyerRequests with success message if no error',async ()=>{
            
            await MessageController.deleteMsgAdmin(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[/]buyerRequests[?]success=Message Deleted from the System Successfully/));
            await sql`INSERT INTO Buyer_Request VALUES('11111111-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000000','Test Req Title 1','Test Description 1','New',NOW()::DATE);`;
        })
        it('should redirect to /admin/buyerRequests with error message if request error',async ()=>{
            const req={
                params:null,
            }
            await MessageController.deleteMsgAdmin(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[/]buyerRequests[?]error=/));
        })
    })
    
});