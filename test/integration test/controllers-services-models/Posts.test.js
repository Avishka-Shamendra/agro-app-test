const PostController = require('../../../controllers/postController');
const sql = require('../../../config/db');
let server;
describe('Post Controller', () => {
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
    describe('addPostPage Method', () => {
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
    describe('addPost Method', () => {
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
    describe('farmerPostPage Method', () => {
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
    describe('viewPost Method',()=>{
        let req;
        beforeEach(() => {
            req={
                params:{postid:'10000000-0000-4000-8000-000000000000'},
                session:{user:{uid:'00000000-0000-4000-8000-000000000004'}},
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
                user:{uid:'00000000-0000-4000-8000-000000000004'},
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
    describe('deletePostAdmin Method', () => {
        let req;
        beforeEach(() => {
            req={
                params:{post_id:''}
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
    describe('deleteFarmerPostAdmin Method', () => {
        let req;
        beforeEach(() => {
            req={
                params:{post_id:''}
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
    describe('markAsSold Method', () => {
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
    describe('deletePostFarmer Method', () => {
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
});