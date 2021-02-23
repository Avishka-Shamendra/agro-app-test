const ifBuyer = require('../../../middleware/ifBuyer');
let server;
    

describe('ifBuyer Middleware', () => {
    const res = {
        render: jest.fn(),
        redirect: jest.fn()
    };

    const next = jest.fn();

    beforeEach(() => {
        server = require('../../../index').server;

    });

    afterEach(() => {
        server.close();
    });

    it("should call next() if session has a user and type is buyer", async () => {
        const req = {session:{ user: {type: 'buyer'}}};
        ifBuyer(req,res,next);
        expect(next).toHaveBeenCalled();
    });
    it("should redirect to '/<type>' if session has a user and type is not buyer", async () => {
        const req = {session:{ user: {type: 'type'}}};
        ifBuyer(req,res,next);
        expect(res.redirect).toHaveBeenCalledWith('/type');
    });
    it("should redirect to '/' if session has a no user", async () => {
        const req = {session:{}};
        ifBuyer(req,res,next);
        expect(res.redirect).toHaveBeenCalledWith('/');
    });
});