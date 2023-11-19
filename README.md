# BandScape-BE

BackEnd - Side of the BandScape project.

## Calls

_get /users_ returns: {statusCode,user{}}
_get /users/extAccess/:externalID_ returns: {id,nick,email,isAdmin,usrImg,usrBio}

_post /users/login_ needs `{ email, password } = req.body;` returns: {statusCode,comparison,payload,user{}}

_post /users/create_

_post /users/update/:userID_

_delete /users/delete/:userID_
