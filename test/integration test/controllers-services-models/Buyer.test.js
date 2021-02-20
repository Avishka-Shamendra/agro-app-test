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
});