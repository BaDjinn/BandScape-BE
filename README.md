# BandScape-BE

BackEnd - Side of the BandScape project.

## Calls

All af this have to be polished and made uniform

### Users
_get /users_ returns: {statusCode,user{}}
_get /users/extAccess/:externalID_ returns: {id,nick,email,isAdmin,usrImg,usrBio}

_post /users/login_ needs `{ email, password } = req.body;` returns: {statusCode,comparison,payload,user{}}

_post /users/create_

_post /users/update/:userID_

_delete /users/delete/:userID_

### posts

_get /posts_ > All of it 

	`Default	= { page = 1, pageSize = 3 }``
	`Usage = `http://localhost:5050/posts?page=#?pageSize=#`

	```
    res = {
		statusCode,
		currentPage,
		totalPages,
		totalPosts,
		posts
	}
    ```

_get /post/:postID_ > Single post

	```
    res = {
		statusCode,
		postByID
	}
    ```

_post /posts/create_
	```
    req = {
		title,
		cover,
		author(userID),
		content
	}
	res = {
		statusCode,
		message,
		payload,
	}
    ```

_patch /post/update/:postId_
```
	req = {
		dataToUpdate = req.body
	}
```

_delete /posts/delete/:postId_


### Comments

_get /comment_ 

    `Usage => /comment?=postID`

_post /comment_

    req = {
        authorID,
        postID,
        content
    }

_patch /comment/:commentId_

```
	req = {
		dataToUpdate = req.body
	}
```

_delete /comment:commentID_