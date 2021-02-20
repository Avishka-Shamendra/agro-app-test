const ComplainController = require('../../../controllers/complainsController');
const sql = require('../../../config/db');
let server;

describe('Complains Controller', () => {
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

    describe("farmerReport method",()=>{
        let req;
        beforeEach(async() => {
            req = {
                body:{
                    reasons: 'Testing complaing a farmer to the admin',
                },
                session:{user:{uid:"00000000-0000-4000-8000-000000000004"}},
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
        
    })

    describe("buyerReport method",()=>{
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
        
    })

    describe("adminComplainsPage method",()=>{
        let req;
        beforeEach(async() => {
            req = {
                session:{user:{uid:1}},
                query:{error:"Error Checking",success:"Success Message"}
            }
        });

        it("should render adminBuyerRequestPage page with error & sucess message", async () => {
            await ComplainController.adminComplainsPage(req,res);
            expect(res.render).toHaveBeenCalledWith('adminComplainsPage',{
                error:"Error Checking",
                success:"Success Message",
                user:{uid:1},
                complains: expect.arrayContaining([expect.objectContaining({
                    comp_id:'00000000-0000-4111-8000-000000000000',
                }),expect.objectContaining({
                    comp_id:'00000000-0000-4222-8000-000000000000',
                })])
    
            });
        });

        it("should redirect to /admin with error message", async () => {
            req.query=null
            await ComplainController.adminComplainsPage(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[?]error=/));   
        });
    })

    describe("delete method",()=>{
        let req;
        beforeEach(async() => {
            req = {
                params:{comp_id:"00000000-0000-4111-8000-000000000000"}
            }
        });

        it("should redirect to /admin/complains with error message", async () => {
            req.params=null
            await ComplainController.delete(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[/]complains[?]error=/));   
        });

        it("should redirect to /admin/complains with sucess message if no errors", async () => {
            await ComplainController.delete(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[/]complains[?]success=Complain Deleted Successfully/));
            sql`INSERT INTO Complain VALUES('00000000-0000-4111-8000-000000000000','00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000003','This is the test complain 1',NOW()::DATE);`   
        });
    })
})