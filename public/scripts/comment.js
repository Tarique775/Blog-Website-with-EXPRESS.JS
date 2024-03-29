// for localhost
const socket = io('http://localhost:5000');
// for deploy
// const socket = io('https://web-blog-bd.herokuapp.com');

const comment = document.getElementById('comment');
const commentHolder = document.getElementById('comment-holder');

// const replyComment = document.getElementById('replyComment');
const ptag = document.getElementById('ptag');
socket.on('new_comment', (msg) => {
    const commentElement = createComment(msg);
    const commentHolders = commentHolder.children[0];
    commentHolder.insertBefore(commentElement, commentHolders);
    ptag.style.display = 'none';
});
// socket.on('new_reply', (replys) => {
//     const replyElement = createReplyElement(replys);
//     const parent = replyComment.parentElement;
//     parent.previousElementSibling.appendChild(replyElement);
// });

comment.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (e.target.value) {
            const postId = comment.dataset.post;
            const data = {
                body: e.target.value,
            };
            const req = reqCommentReply(`/api/comments/${postId}`, 'POST', data);

            fetch(req)
                .then((res) => res.json())
                .then((data) => {
                    // const commentElement = createComment(data);
                    // const commentHolders = commentHolder.children[0];
                    // commentHolder.insertBefore(commentElement, commentHolders);
                    // console.log(data);

                    e.target.value = '';
                })
                .catch((err) => {
                    console.log(err);
                    alert(err.message);
                });
        } else {
            alert('Please Enter A Valid Comment');
        }
    }
});

commentHolder.addEventListener('keypress', (e) => {
    if (commentHolder.hasChildNodes(e.target)) {
        if (e.key === 'Enter') {
            const commentId = e.target.dataset.comment;
            const { value } = e.target;

            if (value) {
                const data = {
                    body: value,
                };
                const req = reqCommentReply(`/api/comments/replies/${commentId}`, 'POST', data);
                fetch(req)
                    .then((res) => res.json())
                    .then((data) => {
                        const replyElement = createReplyElement(data);
                        const parent = e.target.parentElement;
                        parent.previousElementSibling.appendChild(replyElement);
                        // console.log(data);
                        e.target.value = '';
                    })
                    .catch((err) => {
                        console.log(err);
                        alert(err.message);
                    });
            } else {
                alert('Please Enter A Valid Reply');
            }
        }
    }
});

function reqCommentReply(url, method, body) {
    const headers = new Headers();
    headers.append('Accept', 'Application/JSON');
    headers.append('Content-Type', 'Application/JSON');

    const req = new Request(url, {
        method,
        headers,
        body: JSON.stringify(body),
        mode: 'cors',
    });

    return req;
}

function createComment(comment) {
    const innerHTML = `
            <div class="flex-shrink-0">
            <a
            href="/author/${comment.user._id}"
            style="text-decoration: none; color: currentColor"
            ><img src="${
    comment.user.profilePics
}" class="align-self-start rounded-circle mx-3 my-3" style="width: 40px"/></a>
            </div>
            <div class="flex-grow-0 col-md-9 my-3">
            <div class="bg-light border border-1 rounded-3 p-2">
            <a
            href="/author/${comment.user._id}"
            style="text-decoration: none; color: currentColor"
            ><h6>${comment.user.userName}</h6></a>
                <span>${comment.body}</span>
                </div>
                <small>${moment(comment.createdAt).fromNow()}</small>
    
                <div class="my-3">
                    <input type="text" class="form-control" placeholder="Press Enter to Reply" name="reply" data-comment=${
    comment._id
}/>
                </div>
            </div>
      `;

    const div = document.createElement('div');
    div.className = 'd-flex';
    div.innerHTML = innerHTML;

    return div;
}

function createReplyElement(reply) {
    const innerHTML = `
    <div class="flex-shrink-0"><a
    href="/author/${reply.user._id}"
    style="text-decoration: none; color: currentColor"
    ><img src="${
        reply.user.profilePics
}" class="me-3 rounded-circle" style="width: 40px"/></a></div>
        <div class="flex-grow-0 col-md-10">
        <div class="bg-light border border-1 rounded-3 p-2">
        <a
        href="/author/${reply.user._id}"
        style="text-decoration: none; color: currentColor"
        ><h6>${reply.user.userName}</h6></a>
            <span>${reply.replies[reply.replies.length - 1].body}</span>
            </div>
            <small>${moment(reply.replies[reply.replies.length - 1].createAt).fromNow()}</small>
        </div>`;

    const div = document.createElement('div');
    div.className = 'd-flex mt-3';
    div.innerHTML = innerHTML;

    return div;
}
