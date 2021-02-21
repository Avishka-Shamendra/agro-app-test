const { errorResponse}  = require('../../../helpers/errorPageRender');
    
describe('errorPageRender helper', () => {
    let res;
    let next;
    beforeEach(() => {
        res = {
            render: jest.fn(),
            redirect: jest.fn()
        };
        next = jest.fn();
    });
    

    it("should render error page with required message if a message is passed", async () => {
        const message='test message'
        const code = 400
        errorResponse(res,message,code)
        expect(res.render).toHaveBeenCalledWith('error',{
            code:400,
            failed:'test message',
        });
    });
    it("should render error page with required message if though message is passed as an object", async () => {
        const message={message:'test message 2'}
        const code = 500
        errorResponse(res,message,code)
        expect(res.render).toHaveBeenCalledWith('error',{
            code:500,
            failed:'test message 2',
        });
    });
    it("should render error page with error code 400 if code not passed", async () => {
        const message={message:'test message 2'}
        errorResponse(res,message,null)
        expect(res.render).toHaveBeenCalledWith('error',{
            code:400,
            failed:'test message 2',
        });
    });
});