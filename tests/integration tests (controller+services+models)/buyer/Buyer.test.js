const BuyerController = require('../../../controllers/buyerController');
const PostController = require('../../../controllers/postController');
const ComplainController = require('../../../controllers/complainsController');
const MessageController = require('../../../controllers/messageController');
const sql = require('../../../config/db');
let server;
describe('Buyer Functionalities Integration Tests', () => {
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
   
    
    describe('Buyer View Signup Page Functionality : BuyerController signupPage Method;', () => {
        let req;
        beforeEach(() => {
            req={
                query:{
                    error:'test error',
                    email:'test@gmail.com',
                    firstName:'firstName',
                    lastName:'lastName',
                    district:'Colombo',
                    nicNumber:'98100500V',
                    contactNo:'07776456354'
                },
                session:{user:{uid:'00000000-0000-4000-8000-000000000004',type:'buyer'}}
            }
        });
        it('should render buyerSignUp page with necessary info', () => {
            BuyerController.signupPage(req,res);
            expect(res.render).toHaveBeenCalledWith('buyerSignUp',{
                error: req.query.error,
                user : req.session.user,
                email : req.query.email,
                firstName : req.query.firstName,
                lastName : req.query.lastName,
                gender : req.query.gender,
                district : req.query.district,
                nicNumber : req.query.nicNumber,
                contactNo : req.query.contactNo,
            });
        });
    });
    describe('Buyer Sign up Functionality : BuyerController signup Method;', () => {
        let req;
        beforeEach(() => {
            req={
                body:{
                    email: 'test@gmail.com',
                    password: 'test123',
                    confirmPassword: 'test123',
                    firstName:'Devin',
                    lastName:'Yasith',
                    gender:'Male',
                    nicNumber:'981001801V',
                    contactNo:'0777587456',
                    district:'Colombo'
                }
            }
        });
        afterEach(async() => {
          await sql`DELETE FROM userinfo WHERE email='test@gmail.com'`  
        });
        it('should redirect to login page if buyer is successfully registered with no error', async () => {
            await BuyerController.signup(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/[/]login[?]buyerRegSuccess=Registration as a Buyer Successful/)
            );
        });
        it('should redirect back to /buyer/signup with bad request error if email is already registered', async () => {
            req.body.email='test1@gmail.com'
            await BuyerController.signup(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/[/]buyer[/]signup[?]error=BadRequest:  Email is already registered/)
            );
        });
        it('should redirect back to /buyer/signup with bad request error if nic is already registered', async () => {
            req.body.nicNumber='981000200V'
            await BuyerController.signup(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/[/]buyer[/]signup[?]error=BadRequest:  NIC is already registered/)
            );
        });
        it('should redirect back to /buyer/signup with validation error if Joi Validation Fails', async () => {
            req.body.nicNumber='98100'
            await BuyerController.signup(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/[/]buyer[/]signup[?]error=ValidationError/)
            );
        });
    });
    describe('Buyer View Homepage Functionality : BuyerController homePage Method;', () => {
        let req;
        beforeEach(() => {
            req={
                query:{
                    error:'test error',
                    success:'test success',
                    filter_category:'test category',
                    filter_district:'Colombo',
                    min_price:'100',
                    max_price:'200',
                    min_quantity:'500',
                    max_quantity:'1000',
                },
                session:{user:{uid:'00000000-0000-4000-8000-000000000004',type:'buyer'}}
            }
        });
        it('should render buyerHome with all active posts if no error', async () => {
            await BuyerController.homePage(req,res)
            expect(res.render).toHaveBeenCalledWith('buyerHome',{
                error:'test error',
                user:{uid:'00000000-0000-4000-8000-000000000004',type:'buyer'},
                success:'test success',
                posts: expect.arrayContaining([expect.objectContaining({
                            post_id:'10000000-0000-4000-8000-000000000000',
                        }),expect.objectContaining({
                            post_id:'20000000-0000-4000-8000-000000000000',
                        })]),
                filter_category:'test category',
                filter_district:'Colombo',
                min_price:'100',
                max_price:'200',
                min_quantity:'500',
                max_quantity:'1000',
            });
        });
    });
    describe('Buyer Edit Profile Functionality : BuyerController editprofile Method;', () => {
        let req;
        beforeEach(async () => {
            await sql.begin(async sql => {
                await sql`INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-111000000003','buyer_edit_test@gmail.com','buyer','password','testFirstName','testlastName','Male');`
                await sql`INSERT INTO Buyer VALUES ('00000000-0000-4000-8000-111000000003','981111300V','0777111003','Colombo');`
              })
            req={
                body:{
                    email: 'new_mail@gmail.com',
                    firstName:'EditedFirstName',
                    lastName:'EditedLastName',
                    gender:'Other',
                    contactNo:'0777000001',
                    district:'Gampaha'
                },
                params:{uid:'00000000-0000-4000-8000-111000000003'},
                session:{
                    user:{
                        uid:'00000000-0000-4000-8000-000000000004',
                        type:'buyer',
                        email:'buyer_edit_test@gmail.com',
                        name:'testFirstName testLastName',
                        banned:false,
                        firstName:'testFirstName',
                        lastName:'testLastName',
                        gender:'Male',
                        buyerData:{}
                    }
                }
            }
        });
        afterEach(async () => {
            await sql`DELETE FROM userinfo WHERE email='buyer_edit_test@gmail.com'`
            await sql`DELETE FROM userinfo WHERE email='new_mail@gmail.com'`
        });
        it('should update the profile details and redirect to /editProfile with success message if no error',async()=>{
            await BuyerController.editProfile(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/[/]editProfile[?]success=Changes saved sucessfully/)
            );
            expect(req.session.user).toEqual(expect.objectContaining({
                email:'new_mail@gmail.com',
                name:'EditedFirstName EditedLastName',
                banned:false,
                firstName:'EditedFirstName',
                lastName:'EditedLastName',
                gender:'Other',
                buyerData: expect.objectContaining({
                contact_no:'0777000001',
                district:'Gampaha'
                })
            }));
        })
        it("should redirect to '/editProfile' with BadRequest if provided uid is not a Buyer",async ()=>{
            req.params.uid='1'

            await BuyerController.editProfile(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/editProfile[?]error=BadRequest: No Such Buyer Exist/));
            
        });
        it('should redirect to /editProfile with bad request message new email is already registered',async()=>{
            req.body.email='test1@gmail.com'
            await BuyerController.editProfile(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/[/]editProfile[?]error=BadRequest:  Email is already registered/)
            );
            
        })
        it('should redirect to /editProfile with validation error if joi validation fails',async()=>{
            req.body.email='test1'
            await BuyerController.editProfile(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/[/]editProfile[?]error=ValidationError:/)
            );
            
        })
    });
    describe('Buyer View Farmer Profile Functionality : BuyerController farmerProfilePage Method;', () => {
        let req;
        beforeEach(() => {
            req={
                query:{
                    error:'test error',
                    report_success:'test message',
                    reasons:'test reasons',
                },
                session:{user:{uid:'00000000-0000-4000-8000-000000000004',type:'buyer'}},
                params:{farmer_id:'00000000-0000-4000-8000-000000000002'}
            }
        });
        it('should render farmerProfile corresponding to the farmer according to the id, if no error', async () => {
            await BuyerController.farmerProfilePage(req,res)
            expect(res.render).toHaveBeenCalledWith('buyerFarmerProfile',expect.objectContaining({
                error:'test error',
                user:expect.objectContaining({
                    uid:'00000000-0000-4000-8000-000000000004',
                    type:'buyer'
                }),
                report_success:'test message',
                reasons:'test reasons',
                farmer: expect.objectContaining({
                    uid:'00000000-0000-4000-8000-000000000002'
                }),
                posts:expect.arrayContaining([
                    expect.objectContaining({post_id:'10000000-0000-4000-8000-000000000000'}),
                    expect.objectContaining({post_id:'20000000-0000-4000-8000-000000000000'})
                ])
            }));
        });
        it('should redirect to buyer home with bad request error, if provided id is not of a farmer ', async () => {
            req.params.farmer_id='1'
            await BuyerController.farmerProfilePage(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                '/buyer/?error=BadRequest:  No Such Farmer'
            );
        });
    });
    describe('Buyer View Post Functionality : PostController viewPost Method',()=>{
        let req;
        beforeEach(() => {
            req={
                params:{postid:'10000000-0000-4000-8000-000000000000'},
                session:{user:{uid:'00000000-0000-4000-8000-000000000004',type:'buyer'}},
                query:{
                    error: 'test error',
                    msg_error:'test msg_error',
                    msg_success:'test msg_success',
                    request_title:'test title',
                    description:'test description',
                }
            }
        });
        it('should render buyerPostPage with neccessary data if no error', async () => {
            await PostController.viewPost(req,res)
            expect(res.render).toHaveBeenCalledWith('buyerPostPage',{
                error: 'test error',
                user:{uid:'00000000-0000-4000-8000-000000000004',type:'buyer'},
                msg_error:'test msg_error',
                msg_success:'test msg_success',
                request_title:'test title',
                description:'test description',
                post:expect.objectContaining({post_id:'10000000-0000-4000-8000-000000000000'}),
                request:expect.objectContaining({req_msg_id:'11111111-0000-4000-8000-000000000000'})
            });
        });
        it('should redirect to buyer homw eith error message if req error', async () => {
            req.params=null
            await PostController.viewPost(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[?]error=/));
        });
    });
    describe('Buyer Filter Posts Functionality : BuyerController filterPosts Method;', () => {
        let req;
        beforeEach(() => {
            req={
                query:{error:'',success:''},
                body:{
                    filter_category:'vegetable',
                    filter_district:'Colombo',
                    min_price:'100',
                    max_price:'1000',
                    min_quantity:'100',
                    max_quantity:'1000',
                },
                session:{user:{uid:'00000000-0000-4000-8000-000000000004',type:'buyer'}}
            }
        });
        it('should redirect to buyerHome with filtered posts if no error', async () => {
            await BuyerController.filterPosts(req,res)
            expect(res.render).toHaveBeenCalledWith('buyerHome',expect.objectContaining({
                posts:expect.arrayContaining([expect.objectContaining({
                    post_id:'10000000-0000-4000-8000-000000000000',
                }),expect.objectContaining({
                    post_id:'20000000-0000-4000-8000-000000000000',
                })]),
                filter_category:'vegetable',
                filter_district:'Colombo',
                min_price:'100',
                max_price:'1000',
                min_quantity:'100',
                max_quantity:'1000',
            }));
        });
        it('should redirect to buyerHome with error if validation fails on filter', async () => {
            req.body.min_price='-100'
            await BuyerController.filterPosts(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/buyer[?]error=ValidationError/));
        });
        it('should render buyer home with filtered posts and set min_price to zero if it is not specified', async () => {
            req.body.min_price=''
            await BuyerController.filterPosts(req,res)
            expect(res.render).toHaveBeenCalledWith('buyerHome',expect.objectContaining({
                posts:expect.arrayContaining([expect.objectContaining({
                    post_id:'10000000-0000-4000-8000-000000000000',
                }),expect.objectContaining({
                    post_id:'20000000-0000-4000-8000-000000000000',
                })]),
            }));
        });
        it('should render buyer home with filtered posts and set min_quantity to zero if it is not specified', async () => {
            req.body.min_quantity=''
            await BuyerController.filterPosts(req,res)
            expect(res.render).toHaveBeenCalledWith('buyerHome',expect.objectContaining({
                posts:expect.arrayContaining([expect.objectContaining({
                    post_id:'10000000-0000-4000-8000-000000000000',
                }),expect.objectContaining({
                    post_id:'20000000-0000-4000-8000-000000000000',
                })]),
            }));
        });
        it('should render buyer home with filtered posts and set max_price to 100000000 if it is not specified', async () => {
            req.body.max_price=''
            await BuyerController.filterPosts(req,res)
            expect(res.render).toHaveBeenCalledWith('buyerHome',expect.objectContaining({
                posts:expect.arrayContaining([expect.objectContaining({
                    post_id:'10000000-0000-4000-8000-000000000000',
                }),expect.objectContaining({
                    post_id:'20000000-0000-4000-8000-000000000000',
                })]),
            }));
        });
        it('should render buyer home with filtered posts and set max_quantity to 100000000 if it is not specified', async () => {
            req.body.max_quantity=''
            await BuyerController.filterPosts(req,res)
            expect(res.render).toHaveBeenCalledWith('buyerHome',expect.objectContaining({
                posts:expect.arrayContaining([expect.objectContaining({
                    post_id:'10000000-0000-4000-8000-000000000000',
                }),expect.objectContaining({
                    post_id:'20000000-0000-4000-8000-000000000000',
                })]),
            }));
        });
        it('should render buyer home with filtered posts with all categories is it is given as all', async () => {
            req.body.filter_category='all'
            await BuyerController.filterPosts(req,res)
            expect(res.render).toHaveBeenCalledWith('buyerHome',expect.objectContaining({
                posts:expect.arrayContaining([expect.objectContaining({
                    post_id:'10000000-0000-4000-8000-000000000000',
                }),expect.objectContaining({
                    post_id:'20000000-0000-4000-8000-000000000000',
                })]),
            }));
        });
        it('should render buyer home with filtered posts with all districts is it is given as all', async () => {
            req.body.filter_district='all'
            await BuyerController.filterPosts(req,res)
            expect(res.render).toHaveBeenCalledWith('buyerHome',expect.objectContaining({
                posts:expect.arrayContaining([expect.objectContaining({
                    post_id:'10000000-0000-4000-8000-000000000000',
                }),expect.objectContaining({
                    post_id:'20000000-0000-4000-8000-000000000000',
                })]),
            }));
        });
    });
    describe('Buyer Send Buyer Request Fubctionality : MessageController buyerRequest Method;', () => {
        let req;
        beforeEach(async() => {
            await sql`INSERT INTO Post VALUES('50000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000002','Test Product 2','Test Post 2','Descriiption 2','vegetable',100,100,'Colombo','Address 2','0777200000','Active',NOW()::DATE,NOW()::DATE + INTERVAL '30 days',false);`;
            req = {
                body:{
                    title: 'fdsafdsafdsafdsaf',
                    description: 'This is the testing for buyer requests.Testing case',
                },
                session:{user:{uid:'00000000-0000-4000-8000-000000000004',type:'buyer'}},
                params:{postid:"50000000-0000-4000-8000-000000000000"}
            }
        });
        afterEach(async() => {
            // Delete new rows added in test
             await sql`DELETE FROM Post WHERE post_id='50000000-0000-4000-8000-000000000000'`;
        });
        it('should redirect /buyer/viewpost page with success message if no error',async ()=>{
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]viewpost[/]50000000-0000-4000-8000-000000000000[?]msg_success=Your buyer request is sent to the farmer./));
        })

        it('should redirect /buyer/viewpost with Validation Error if Title Joi Validation fails',async ()=>{
            req.body.title="ab"
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/buyer[/]viewpost[/]50000000-0000-4000-8000-000000000000[?]msg_error=ValidationError: "Title" length must be at least 5 characters long/));
        })

        it('should redirect /buyer/viewpost with Validation Error if Description Joi Validation fails',async ()=>{
            req.body.description="ab"
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]viewpost[/]50000000-0000-4000-8000-000000000000[?]msg_error=ValidationError: "Message" length must be at least 20 characters/));
        })
        it('should redirect /buyer/viewpost with Error if already have sent a buyer request',async ()=>{
            req.session.user.uid="00000000-0000-4000-8000-000000000004"
            req.params.postid="10000000-0000-4000-8000-000000000000"
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]viewpost[/]10000000-0000-4000-8000-000000000000[?]msg_error=Unauthorized: You have already sent a request to this post/));
        })
        it('should redirect /buyer/viewpost with Error if post is not in status Active',async ()=>{
            req.params.postid="30000000-0000-4000-8000-000000000000"
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]viewpost[/]30000000-0000-4000-8000-000000000000[?]msg_error=BadRequest: OOPS could not send message/));
        })
        it('should redirect /buyer/viewpost with Error if user is not a buyer',async ()=>{
            req.session.user.uid="00000000-0000-4000-8000-000000000002"
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]viewpost[/]50000000-0000-4000-8000-000000000000[?]msg_error=Unauthorized: You do not have permission to add new posts/));
        })
    });
    describe('Buyer View All Sent Requests Functionality : BuyerController sentRequestsPage Method;', () => {
        let req;
        beforeEach(() => {
            req={
                query:{
                    error:'test error',
                    del_suc:'test del_suc',
                },
                session:{user:{uid:'00000000-0000-4000-8000-000000000004',type:'buyer'}}
            }
        });
        it('should render buyerSentRequests page with requests if no error', async () => {
            await BuyerController.sentRequestsPage(req,res)
            expect(res.render).toHaveBeenCalledWith('buyerSentRequests',expect.objectContaining({
                error:'test error',
                del_suc:'test del_suc',
                user:{uid:'00000000-0000-4000-8000-000000000004',type:'buyer'},
                newRequests:expect.arrayContaining([
                    expect.objectContaining({
                    req_msg_id:'11111111-0000-4000-8000-000000000000'
                    }),
                    expect.objectContaining({
                        req_msg_id:'33333333-0000-4000-8000-000000000000'
                    })
                ]),
                interestedRequests:expect.arrayContaining([
                    expect.objectContaining({
                    req_msg_id:'55555555-0000-4000-8000-000000000000'
                    })
                ]),
                notInterestedRequests:expect.arrayContaining([
                    expect.objectContaining({
                    req_msg_id:'66666666-0000-4000-8000-000000000000'
                    })
                ]),
            }));
            
        });
        it('should redirect to buyer home incase of error',async ()=>{
            req.session.user=null
            await BuyerController.sentRequestsPage(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/buyer[?]error/));
        })
    });
    describe("Buyer Delete Buyer Request Fubctionality : MessageController deleteMsg Method;",()=>{
        let req;
        beforeEach(async() => {
            req = {
                params:{msg_id:"11111111-0000-4000-8000-000000000000"},
                user:{uid:'00000000-0000-4000-8000-000000000004',type:'buyer'}
            }
        });

        it('should redirect /buyer/sentRequests with success message if no error',async ()=>{
            req.params.postid="30000000-0000-4000-8000-000000000000"
            await MessageController.deleteMsg(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]sentRequests[?]del_suc=Message Deleted from the System Successfully/));
            await sql`INSERT INTO Buyer_Request VALUES('11111111-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000000','Test Req Title 1','Test Description 1','New',NOW()::DATE);`;
        })

        it('should redirect to /buyer/sentRequests with error message ir request error',async ()=>{
            const req={
                params:null,
            }
            await MessageController.deleteMsg(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]sentRequests[?]error=/));
        })
    })
    describe("Buyer Delete Buyer Request From Post Fubctionality : MessageController deleteMsgViewPost Method;",()=>{
        let req;
        beforeEach(async() => {
            req = {
                params:{msg_id:"11111111-0000-4000-8000-000000000000"},
                user:{uid:'00000000-0000-4000-8000-000000000004',type:'buyer'}
            }
        });

        it('should redirect /buyer with success message if no error',async ()=>{
            req.params.postid="30000000-0000-4000-8000-000000000000"
            await MessageController.deleteMsgViewPost(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[?]success=Message Deleted from the System Successfully/));
            await sql`INSERT INTO Buyer_Request VALUES('11111111-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000000','Test Req Title 1','Test Description 1','New',NOW()::DATE);`;
        })
        it('should redirect to /buyer with error message if request error',async ()=>{
            const req={
                params:null,
            }
            await MessageController.deleteMsgViewPost(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[?]error=/));
        })
    })
    describe("Buyer Report Farmer Functionality : ComplainController farmerReport Method;",()=>{
        let req;
        beforeEach(async() => {
            req = {
                body:{
                    reasons: 'Testing complaing a farmer to the admin',
                },
                session:{user:{uid:'00000000-0000-4000-8000-000000000004',type:'buyer'}},
                params:{farmer_id:"50000000-0000-4000-8000-000000000000"}
            }
        });

        it("should redirect to '/buyer/farmerProfile/<farmer_id>' with Validation Error if Joi Validation fails", async () => {
            req.body.reasons="A"
            await ComplainController.farmerReport(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/error=ValidationError:/));   
        });

        it("should redirect to '/buyer/farmerProfile/<farmer_id>' with error if you have already reported the user", async () => {
            req.session.user.uid="00000000-0000-4000-8000-000000000004"
            req.params.farmer_id="00000000-0000-4000-8000-000000000002"
            await ComplainController.farmerReport(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]farmerProfile[/]00000000-0000-4000-8000-000000000002[?]error=Unauthorized: You have already reported the user/));   
        });

        it("should redirect to '/buyer/farmerProfile/<farmer_id>' with success if no error", async () => {
            req.session.user.uid="00000000-0000-4000-8000-000000000005"
            req.params.farmer_id="00000000-0000-4000-8000-000000000003"
            await ComplainController.farmerReport(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]farmerProfile[/]00000000-0000-4000-8000-000000000003[?]report_success=Successfully Reported User To Admin/));
            await sql`DELETE FROM complain WHERE uid='00000000-0000-4000-8000-000000000003' and complainer_id='00000000-0000-4000-8000-000000000005'`;   
        });
        
    });
});