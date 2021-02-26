const FarmerController = require('../../../controllers/farmerController');
const ComplainController = require('../../../controllers/complainsController');
const PostController = require('../../../controllers/postController');
const MessageController = require('../../../controllers/messageController');
const sql = require('../../../config/db');
const ImageController = require('../../../controllers/imageController');
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
    describe('Farmer View Signup Page Functionality : FarmerController signupPage Method;', () => {
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
    describe('Farmer Sign up Functionality : FarmerController signup Method;', () => {
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
    describe('Farmer View HomePage Functionality : FarmerController homePage Method;', () => {
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
    describe('Farmer View All His/Her Posts Functionality : FarmerController myPostsPage Method;', () => {
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
    describe('Farmer View Single Post Functionality : PostController farmerPostPage Method;', () => {
        let req;
        beforeEach(() => {
            req={
                query:{
                    error:'test error',
                    success:'test success',
                    req_error:'test req error',
                    req_success:'test req success'
                },
                session:{user:{uid:'00000000-0000-4000-8000-000000000002'}},
                params:{post_id:'10000000-0000-4000-8000-000000000000'}

            }
        });
        it('should render farmerPostPage with neccessary data if no error', async () => {
            await PostController.farmerPostPage(req,res)
            expect(res.render).toHaveBeenCalledWith('farmerPostPage',expect.objectContaining({
                error:'test error',
                    success:'test success',
                    req_error:'test req error',
                    req_success:'test req success',
                    user:{uid:'00000000-0000-4000-8000-000000000002'},
                    post:expect.objectContaining({post_id:'10000000-0000-4000-8000-000000000000'}),
                    requests:expect.arrayContaining([
                        expect.objectContaining({req_msg_id:'11111111-0000-4000-8000-000000000000'}),
                        expect.objectContaining({req_msg_id:'22222222-0000-4000-8000-000000000000'}),
                    ])
            }));
        });
        it("should reddirect to '/farmer/myPosts' if  req error", async () => {
            req.params=null;
            await PostController.farmerPostPage(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/[/]farmer[/]myPosts[?]error=/)
            );
        });
    });
    describe('Farmer Mark Post as Sold Functionality : PostController markAsSold Method;', () => {
        let req;
        beforeEach(() => {
            req={
                params:{post_id:''}
            }
        });
        it('should change the status of post to "Sold" and redirect to "/farmer/myPosts" with success if no error', async () => {
            await sql`INSERT INTO Post VALUES('99000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000002','Test Product99','Test Post 1','Descriiption99','vegetable',100,100,'Colombo','Address99','0777100000','Active',NOW()::DATE,NOW()::DATE + INTERVAL '30 days',false)`
            req.params.post_id='99000000-0000-4000-8000-000000000000';
            await PostController.markAsSold(req,res)
            const [result] = await sql`DELETE FROM Post WHERE post_id='99000000-0000-4000-8000-000000000000' RETURNING *`;
            expect(res.redirect).toHaveBeenCalledWith(`/farmer/post/99000000-0000-4000-8000-000000000000?success=Post State changed to SOLD.`);
            expect(result.status).toBe('Sold');
        });
        it('should redirect to "/farmer/myPosts" with error message if req error', async () => {
            req.params=null;
           await PostController.markAsSold(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]farmer[/]myPosts[?]error=/));
        });
    });
    describe('Farmer Delete Post Functionality : PostController deletePostFarmer Method;', () => {
        let req;
        beforeEach(() => {
            req={
                params:{post_id:''}
            }
        });
        it('should delete the post and redirect to "/farmer/myPosts" with success if no error', async () => {
            await sql`INSERT INTO Post VALUES('99000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000002','Test Product99','Test Post 1','Descriiption99','vegetable',100,100,'Colombo','Address99','0777100000','Active',NOW()::DATE,NOW()::DATE + INTERVAL '30 days',false)`
            req.params.post_id='99000000-0000-4000-8000-000000000000';
            await PostController.deletePostFarmer(req,res)
            const [result] = await sql`SELECT * FROM Post WHERE post_id='99000000-0000-4000-8000-000000000000'`;
            expect(res.redirect).toHaveBeenCalledWith(`/farmer/myPosts?success=Post deleted successfully`);
            expect(result).toBeFalsy();
        });
        it('should redirect to "/farmer/myPosts" with error if no post match to given id', async () => {
            req.params.post_id='99000000-0000-4000-8000-000000000000';
            await PostController.deletePostFarmer(req,res)
            expect(res.redirect).toHaveBeenCalledWith(`/farmer/myPosts?error=Could not delete the post.Please try again later`);
        });
        it('should redirect to "/farmer/myPosts" with error message if req error', async () => {
            req.params=null;
           await PostController.deletePostFarmer(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]farmer[/]myPosts[?]error=/));
        });
    });
    describe('Farmer View New Post Page Functionality : PostController addPostPage Method;', () => {
        let req;
        beforeEach(() => {
            req={
                query:{
                    error:'test error',
                    title:'test title',
                    product_name:'test name',
                    expected_price:'test price',
                    quantity:'test quantity',
                    phone_num:'0777345243',
                    description:'test desc',
                    address:'test address',
                    district:'Colombo',
                    product_category:'test category'
                },
                session:{
                    user:{
                        uid:'00000000-0000-4000-8000-000000000002',
                        farmerData:{
                            contact_no:'0777243345',
                            address:'test address 2',
                            district:'Gampaha'
                        }  
                    }
                }
            }
        });
        it('should render addPostPage with required details from req.query if data is available', async () => {
            await PostController.addPostPage(req,res);
            expect(res.render).toHaveBeenCalledWith('farmerAddPost',{
                error:'test error',
                    title:'test title',
                    user:{
                        uid:'00000000-0000-4000-8000-000000000002',
                        farmerData:{
                            contact_no:'0777243345',
                            address:'test address 2',
                            district:'Gampaha'
                        }  
                    },
                    product_name:'test name',
                    expected_price:'test price',
                    quantity:'test quantity',
                    phone_num:'0777345243',
                    description:'test desc',
                    address:'test address',
                    district:'Colombo',
                    product_category:'test category'
            });
        });
        it('should render addPostPage with required details from req.session if data is not available in req.query', async () => {
            req.query.phone_num=null,
            req.query.address=null,
            req.query.district=null,
            await PostController.addPostPage(req,res);
            expect(res.render).toHaveBeenCalledWith('farmerAddPost',{
                error:'test error',
                    title:'test title',
                    user:{
                        uid:'00000000-0000-4000-8000-000000000002',
                        farmerData:{
                        contact_no:'0777243345',
                        address:'test address 2',
                        district:'Gampaha'
                        }  
                    },
                    product_name:'test name',
                    expected_price:'test price',
                    quantity:'test quantity',
                    phone_num:'0777243345',
                    description:'test desc',
                    address:'test address 2',
                    district:'Gampaha',
                    product_category:'test category'
            });
        }); 
        it('should render addPostPage by setting phone_num,distcrict,address to undefined if no data can be obtained from session details',async()=>{
            req.query.phone_num=null,
            req.query.address=null,
            req.query.district=null,
            req.session.user.farmerData=null;
            await PostController.addPostPage(req,res);
            expect(res.render).toHaveBeenCalledWith('farmerAddPost',{
                error:'test error',
                    title:'test title',
                    user:{
                        uid:'00000000-0000-4000-8000-000000000002',
                        farmerData:null,
                    },
                    product_name:'test name',
                    expected_price:'test price',
                    quantity:'test quantity',
                    phone_num:undefined,
                    description:'test desc',
                    address:undefined,
                    district:undefined,
                    product_category:'test category'
            });
        })
    });
    describe('Farmer Add New Post Functionality : PostController addPost Method;', () => {
        let req;
        beforeEach(() => {
            req={
                session:{user:{uid:'00000000-0000-4000-8000-000000000002'}},
                body:{
                    title:"addPost Method Test",
                    product_name:"addPost Method Test",
                    quantity:100,
                    expected_price:100,
                    description:"Description",
                    phone_num:"0777555666",
                    product_category:"vegetable",
                    district:"Colombo",
                    address:"Address"
                }
            }
        });
        it("should add a new post to DB and redirect to '/farmer' if no error", async () => {
            await PostController.addPost(req,res)
            const [result] = await sql`DELETE FROM post WHERE title='addPost Method Test' AND product_name='addPost Method Test' RETURNING *;`
            expect(res.redirect).toHaveBeenCalledWith('/farmer?new_post_success=Your post is now Active .You can view the post in "My Posts" section.You can add an image to your post, delete the post from there.');
            expect(result).toHaveProperty("farmer_id",'00000000-0000-4000-8000-000000000002')
        });
        it("should redirect to '/farmer/addPost' with unauthorized error if user is not a farmer", async () => {
            req.session.user.uid='00000000-0000-4000-8000-000000000004'
            await PostController.addPost(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]farmer[/]addPost[?]error=Unauthorized: You do not have permission to add new posts/));
        });
        it("should redirect to '/farmer/addPost' with validation error if Joi validation Fails", async () => {
            req.body.phone_num='A'
            await PostController.addPost(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]farmer[/]addPost[?]error=ValidationError/));
        });
    });
    describe("Farmer Add Image to Post Functionality : ImageController addPost Image Method", () => {
        let req;
        beforeEach(() => {
            req={
                file:{
                    mimeType:'image',
                    originalname:'test.png',
                    data:'10001000',
                },
                params:{post_id:''},
                session:{user:{uid:'00000000-0000-4000-8000-000000000002'}}
            }
        });
        it('should redirect to "/farmer/post/<post_id> with success message if image is uploaded successfully"', async () => {
            await sql`INSERT INTO Post VALUES('99000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000002','Test Product99','Test Post 1','Descriiption99','vegetable',100,100,'Colombo','Address99','0777100000','Active',NOW()::DATE,NOW()::DATE + INTERVAL '30 days',false)`
            req.params.post_id='99000000-0000-4000-8000-000000000000';
            await ImageController.addPostImage(req,res)
            expect(res.redirect).toHaveBeenCalledWith('/farmer/post/99000000-0000-4000-8000-000000000000?success=Added Image Successfully')
            await sql`DELETE FROM Post where post_id=${req.params.post_id}`
        });
        it('should redirect to "/farmer/post/<post_id> with error if no file is provided for upload"', async () => {
            req.file=undefined
            req.params.post_id='99000000-0000-4000-8000-000000000000';
            await ImageController.addPostImage(req,res)
            expect(res.redirect).toHaveBeenCalledWith('/farmer/post/99000000-0000-4000-8000-000000000000?error=BadRequest: You must select a file.')
        });
        it('should redirect to "/farmer/post/<post_id> with success message if image is uploaded and old image is replaced successfully"', async () => {
            await sql`INSERT INTO Post VALUES('99000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000002','Test Product99','Test Post 1','Descriiption99','vegetable',100,100,'Colombo','Address99','0777100000','Active',NOW()::DATE,NOW()::DATE + INTERVAL '30 days',true)`//last field is set to true to mock previous upload
            await sql`INSERT INTO Post_Image VALUES('99000000-0000-4000-8000-000000000000','png','test image','11001100')`
            req.params.post_id='99000000-0000-4000-8000-000000000000';
            await ImageController.addPostImage(req,res)
            expect(res.redirect).toHaveBeenCalledWith('/farmer/post/99000000-0000-4000-8000-000000000000?success=Added Image Successfully')
            await sql`DELETE FROM Post where post_id=${req.params.post_id}`
        });
    });
    
    describe("Farmer Mark Buyer Request as Interested Functionality : MessageController markAsInterested Method",()=>{
        let req;
        beforeEach(async() => {
            req = {
                params:{req_id:"11111111-0000-4000-8000-000000000000",
                        post_id:"10000000-0000-4000-8000-000000000000"}
            }
        });

        it('should redirect /farmer/post with success message if no error',async ()=>{
            await MessageController.markAsInterested(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]farmer[/]post[/]10000000-0000-4000-8000-000000000000[?]req_success=Request Message Sucessfully Marked as Interested#requests/));
            await sql`
            UPDATE buyer_request 
            SET req_state='New'
            WHERE req_msg_id='11111111-0000-4000-8000-000000000000'
            RETURNING *
            `;
        })

        it('should redirect /farmer/post with error Message',async ()=>{
            req.params.req_id=null
            await MessageController.markAsInterested(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]farmer[/]post[/]10000000-0000-4000-8000-000000000000[?]req_error=Could not change state to Interested.Please try again later#requests/));
        })

    });

    describe("Farmer Mark Buyer Request as Not-Interested Functionality : MessageController markAsNotInterested Method",()=>{
        let req;
        beforeEach(async() => {
            req = {
                params:{req_id:"11111111-0000-4000-8000-000000000000",
                        post_id:"10000000-0000-4000-8000-000000000000"}
            }
        });

        it('should redirect /farmer/post with success message if no error',async ()=>{
            await MessageController.markAsNotInterested(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]farmer[/]post[/]10000000-0000-4000-8000-000000000000[?]req_success=Request Message Sucessfully Marked as Not Interested#requests/));
            await sql`
            UPDATE buyer_request 
            SET req_state='New'
            WHERE req_msg_id='11111111-0000-4000-8000-000000000000'
            RETURNING *
            `;
        })

        it('should redirect /farmer/post with error Message',async ()=>{
            req.params.req_id=null
            await MessageController.markAsNotInterested(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]farmer[/]post[/]10000000-0000-4000-8000-000000000000[?]req_error=Could not change state to Not Interested.Please try again later#requests/));
        })

    });
    describe('Farmer View Buyer Profile Functionality : FarmerController buyerProfilePage Method;', () => {
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
    describe("Farmer Report Buyer Functionality : ComplainController buyerReport Method;",()=>{
        let req;
        beforeEach(async() => {
            req = {
                body:{
                    reasons: 'Testing complaing a farmer to the admin',
                },
                session:{user:{uid:"00000000-0000-4000-8000-000000000004"}},
                params:{buyer_id:"50000000-0000-4000-8000-000000000000"}
            }
        });

        it("should redirect to '/farmer/buyerProfile/<buyer_id>' with Validation Error if Joi Validation fails", async () => {
            req.body.reasons="A"
            await ComplainController.buyerReport(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/error=ValidationError:/));   
        });

        it("should redirect to '/farmer/buyerProfile/<buyer_id>' with error if you have already reported the user", async () => {
            req.session.user.uid="00000000-0000-4000-8000-000000000003"
            req.params.buyer_id="00000000-0000-4000-8000-000000000004"
            await ComplainController.buyerReport(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]farmer[/]buyerProfile[/]00000000-0000-4000-8000-000000000004[?]error=Unauthorized: You have already reported the user/));   
        });

        it("should redirect to '/farmer/buyerProfile/<buyer_id>' with success if no error", async () => {
            req.session.user.uid="00000000-0000-4000-8000-000000000002"
            req.params.buyer_id="00000000-0000-4000-8000-000000000004"
            await ComplainController.buyerReport(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]farmer[/]buyerProfile[/]00000000-0000-4000-8000-000000000004[?]report_success=Successfully Reported User To Admin/));
            await sql`DELETE FROM complain WHERE uid='00000000-0000-4000-8000-000000000004' and complainer_id='00000000-0000-4000-8000-000000000002'`;   
        });
        
    });
    describe('Farmer Edit Profile Functionality : FarmerController editprofile Method;', () => {
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
        it("should redirect to '/editProfile' with BadRequest if provided uid is not farmer",async ()=>{
            req.params.uid='1'

            await FarmerController.editProfile(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/editProfile[?]error=BadRequest: No Such Farmer Exist/));
            
        });
        it('should redirect to /editProfile with validation error if joi validation fails',async()=>{
            req.body.email='test1'
            await FarmerController.editProfile(req,res)
            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/[/]editProfile[?]error=ValidationError:/)
            );
            
        });
    });
 


    
});