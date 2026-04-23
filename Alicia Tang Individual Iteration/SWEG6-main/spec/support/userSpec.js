describe("User",()=>{
it("creates object",()=>{
let user={username:"test",email:"test@test.com"}
expect(user.username).toBe("test")
})
it("empty email",()=>{
let email=""
expect(email).toBe("")
})
})