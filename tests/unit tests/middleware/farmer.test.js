const ifFarmer = require('../../../middleware/ifFarmer');
let server;
    

describe('ifFarmer Middleware', () => {
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

    it("should call next() if session has a user and type is farmer", async () => {
        const req = {session:{ user: {type: 'farmer'}}};
        ifFarmer(req,res,next);
        expect(next).toHaveBeenCalled();
    });
    it("should redirect to '/<type>' if session has a user and type is not farmer", async () => {
        const req = {session:{ user: {type: 'type'}}};
        ifFarmer(req,res,next);
        expect(res.redirect).toHaveBeenCalledWith('/type');
    });
    it("should redirect to '/' if session has a no user", async () => {
        const req = {session:{}};
        ifFarmer(req,res,next);
        expect(res.redirect).toHaveBeenCalledWith('/');
    });
});