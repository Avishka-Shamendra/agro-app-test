const FarmerController = require('../../../controllers/farmerController');
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
                session:{user:{uid:'00000000-0000-4000-8000-000000000002'}},
                query:{
                    error:'test error',
                    new_post_success:'test success',
                }
            }
        });
        it('should render farmerHome with all new requests if no error', async () => {
            await FarmerController.homePage(req,res)
            expect(res.render).toHaveBeenCalledWith('farmerHome',expect.objectContaining({
                error:'test error',
                new_post_success:'test success',
                user:{uid:'00000000-0000-4000-8000-000000000002'},
                requests:expect.arrayContaining([
                    expect.objectContaining({req_msg_id:'11111111-0000-4000-8000-000000000000'}),
                    expect.objectContaining({req_msg_id:'33333333-0000-4000-8000-000000000000'}),
                ])
            })
            );
        });
    });
    describe('myPostsPage method', () => {
        let req;
        beforeEach(() => {
            req={
                session:{user:{uid:'00000000-0000-4000-8000-000000000002'}},
                query:{
                    error:'test error',
                    success:'test success',
                }
            }
        });
        it('should render farmer myPosts page with ncessay posts if no error', async () => {
            await sql`INSERT INTO Post VALUES('99000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000002','Test Product99','Test Post 1','Descriiption99','vegetable',100,100,'Colombo','Address99','0777100000','Sold',NOW()::DATE,NOW()::DATE + INTERVAL '30 days',false)`
            await sql`INSERT INTO Post VALUES('98000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000002','Test Product98','Test Post 1','Descriiption98','vegetable',100,100,'Colombo','Address98','0777100000','Expired',NOW()::DATE,NOW()::DATE + INTERVAL '30 days',false)`
            await FarmerController.myPostsPage(req,res)
            expect(res.render).toHaveBeenCalledWith('farmerMyPosts',expect.objectContaining({
                error:'test error',
                success:'test success',
                user:{uid:'00000000-0000-4000-8000-000000000002'},
                posts:expect.arrayContaining([
                    expect.objectContaining({post_id:'10000000-0000-4000-8000-000000000000'}),
                    expect.objectContaining({post_id:'20000000-0000-4000-8000-000000000000'}),
                    expect.objectContaining({post_id:'99000000-0000-4000-8000-000000000000'}),
                    expect.objectContaining({post_id:'98000000-0000-4000-8000-000000000000'}),
                    
                ]),
                activePosts:expect.arrayContaining([
                    expect.objectContaining({post_id:'10000000-0000-4000-8000-000000000000'}),
                    expect.objectContaining({post_id:'20000000-0000-4000-8000-000000000000'}),
                    
                ]),
                soldPosts:expect.arrayContaining([
                    expect.objectContaining({post_id:'99000000-0000-4000-8000-000000000000'}),
                ]),
                expiredPosts:expect.arrayContaining([
                    expect.objectContaining({post_id:'98000000-0000-4000-8000-000000000000'}),    
                ]),
            }));
            await sql`DELETE FROM Post WHERE post_id='99000000-0000-4000-8000-000000000000'`
            await sql`DELETE FROM Post WHERE post_id='98000000-0000-4000-8000-000000000000'`

        });
        it('should redirect to farmer home with error in case of req error',async()=>{
            req.query=null,
            await FarmerController.myPostsPage(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/[/]farmer[?]error=/)
            );
        });
    });
    describe('signupPage method', () => {
        let req;
        beforeEach(() => {
            req={
                session:{user:{uid:'00000000-0000-4000-8000-000000000002'}},
                query:{
                    error:'test error',
                    email : 'test@gmail.com',
                    firstName : 'test firstName',
                    lastName : 'test lastName',
                    gender : 'Male',
                    district : 'Colombo',
                    nicNumber : '981000234V',
                    contactNo : '0777654234',
                    address : 'test address',
                }
            }
        });
        it('should render farmerSignup Page method with neccessary data', async() => {
            await FarmerController.signupPage(req,res)
            expect(res.render).toHaveBeenCalledWith('farmerSignUp',{
                error:'test error',
                user:{uid:'00000000-0000-4000-8000-000000000002'},
                email : 'test@gmail.com',
                firstName : 'test firstName',
                lastName : 'test lastName',
                gender : 'Male',
                district : 'Colombo',
                nicNumber : '981000234V',
                contactNo : '0777654234',
                address : 'test address',
            });
        });
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
                    district:'Colombo',
                    address:'No 123, Colombo'
                }
            }
        });
        afterEach(async() => {
            await sql`DELETE FROM userinfo WHERE email='test@gmail.com'`  
          });
          it('should redirect to login page if farmer is successfully registered with no error', async () => {
              await FarmerController.signup(req,res)
              expect(res.redirect).toHaveBeenCalledWith(
                  expect.stringMatching(/[/]login[?]farmerRegSuccess=Registration as Farmer Successful/)
              );
          });
          it('should redirect back to /farmer/signup with bad request error if email is already registered', async () => {
              req.body.email='test1@gmail.com'
              await FarmerController.signup(req,res)
              expect(res.redirect).toHaveBeenCalledWith(
                  expect.stringMatching(/[/]farmer[/]signup[?]error=BadRequest:  Email is already registered/)
              );
          });
          it('should redirect back to /farmer/signup with bad request error if nic is already registered', async () => {
              req.body.nicNumber='981000200V'
              await FarmerController.signup(req,res)
              expect(res.redirect).toHaveBeenCalledWith(
                  expect.stringMatching(/[/]farmer[/]signup[?]error=BadRequest:  NIC is already registered/)
              );
          });
          it('should redirect back to /farmer/signup with validation error if Joi Validation Fails', async () => {
              req.body.nicNumber='98100'
              await FarmerController.signup(req,res)
              expect(res.redirect).toHaveBeenCalledWith(
                  expect.stringMatching(/[/]farmer[/]signup[?]error=ValidationError/)
              );
          });
    });
    describe('editprofile method', () => {
        let req;
        beforeEach(async () => {
            await sql.begin(async sql => {
                await sql`INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-111000000003','farmer_edit_test@gmail.com','farmer','password','testFirstName','testlastName','Male');`
                await sql`INSERT INTO Farmer VALUES ('00000000-0000-4000-8000-111000000003','981111300V','0777111003','Colombo','Test Address');`
              })
            req={
                body:{
                    email: 'new_mail@gmail.com',
                    firstName:'EditedFirstName',
                    lastName:'EditedLastName',
                    gender:'Other',
                    contactNo:'0777000001',
                    district:'Gampaha',
                    address:'New Address'
                },
                params:{uid:'00000000-0000-4000-8000-111000000003'},
                session:{
                    user:{
                        email:'farmer_edit_test@gmail.com',
                        name:'testFirstName testLastName',
                        banned:false,
                        firstName:'testFirstName',
                        lastName:'testLastName',
                        gender:'Male',
                        address:'Test Address',
                        farmerData:{}
                    }
                }
            }
        });
        afterEach(async () => {
            await sql`DELETE FROM userinfo WHERE email='farmer_edit_test@gmail.com'`
            await sql`DELETE FROM userinfo WHERE email='new_mail@gmail.com'`
        });
        it('should update the profile details and redirect to /editProfile with success message if no error',async()=>{
            await FarmerController.editProfile(req,res)
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
                farmerData: expect.objectContaining({
                contact_no:'0777000001',
                district:'Gampaha',
                address:'New Address',
                })
            }));
        })
        it('should redirect to /editProfile with bad request message new email is already registered',async()=>{
            req.body.email='test1@gmail.com'
            await FarmerController.editProfile(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/[/]editProfile[?]error=BadRequest:  Email is already registered/)
            );
            
        })
        it('should redirect to /editProfile with validation error if joi validation fails',async()=>{
            req.body.email='test1'
            await FarmerController.editProfile(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/[/]editProfile[?]error=ValidationError:/)
            );
            
        });
    });
    describe('buyerProfilePage method', () => {
        let req;
        beforeEach(() => {
            req={
                query:{
                    error:'test error',
                    report_success:'test message',
                    reasons:'test reasons',
                },
                session:{user:{uid:'00000000-0000-4000-8000-000000000002'}},
                params:{buyer_id:'00000000-0000-4000-8000-000000000004'}
            }
        });
        it('render buyerProfile corresponding to the buyer according to the id, if no error', async () => {
            await FarmerController.buyerProfilePage(req,res)
            expect(res.render).toHaveBeenCalledWith('farmerBuyerProfilePage',expect.objectContaining({
                error:'test error',
                user:expect.objectContaining({
                    uid:'00000000-0000-4000-8000-000000000002'
                }),
                report_success:'test message',
                reasons:'test reasons',
                buyer: expect.objectContaining({
                    uid:'00000000-0000-4000-8000-000000000004'
                }),
            }));
        });
        it('should redirect to farmer home with bad request error, if provided id is not of a buyer ', async () => {
            req.params.buyer_id='1'
            await FarmerController.buyerProfilePage(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                '/farmer/?error=BadRequest:  No Such Buyer'
            );
        });
    });
});