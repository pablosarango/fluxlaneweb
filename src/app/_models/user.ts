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
}
