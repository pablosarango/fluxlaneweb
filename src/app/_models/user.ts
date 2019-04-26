export class User {
    _id: String;
    email: String;
    displayName: String;
    password: String;
    avatar: String;
    signupDate: Date;
    lastLogin: Date;
    token: String;
    rol: String;
    vehicle: String;
    state: String;
    pending_routes: Array<String>;

    constructor () {
        this._id = '';
        this.email = '';
        this.displayName = '';
        this.password = '';
        this.avatar = '';
        this.signupDate = new Date();
        this.lastLogin = new Date();
        this.token = '';
        this.rol = '';
        this.vehicle = '';
        this.state = '';
        this.pending_routes = [];
    }
}
