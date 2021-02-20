const BuyerController = require('../../../controllers/buyerController');
const sql = require('../../../config/db');
let server;
describe('Buyer Controller', () => {
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
    describe('homePage method', () => {
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
                session:{user:{uid:'00000000-0000-4000-8000-000000000004'}}
            }
        });
        it('should render buyerHome with all active posts if no error', async () => {
            await BuyerController.homePage(req,res)
            expect(res.render).toHaveBeenCalledWith('buyerHome',{
                error:'test error',
                user:{uid:'00000000-0000-4000-8000-000000000004'},
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
    describe('filterPosts method', () => {
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
                session:{user:{uid:'00000000-0000-4000-8000-000000000004'}}
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
    describe('signupPage method', () => {
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
                session:{user:{uid:''}}
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
    describe('sentRequestsPage method', () => {
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
    describe('signup method', () => {
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
    describe('editprofile method', () => {
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
    describe('farmerProfilePage method', () => {
        let req;
        beforeEach(() => {
            req={
                query:{
                    error:'test error',
                    report_success:'test message',
                    reasons:'test reasons',
                },
                session:{user:{uid:'00000000-0000-4000-8000-000000000004'}},
                params:{farmer_id:'00000000-0000-4000-8000-000000000002'}
            }
        });
        it('render farmerProfile corresponding to the farmer according to the id, if no error', async () => {
            await BuyerController.farmerProfilePage(req,res)
            expect(res.render).toHaveBeenCalledWith('buyerFarmerProfile',expect.objectContaining({
                error:'test error',
                user:expect.objectContaining({
                    uid:'00000000-0000-4000-8000-000000000004'
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
});