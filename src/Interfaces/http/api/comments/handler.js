const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const { threadId } = request.params;
    const { id: owner } = request.auth.credentials;
    const { content } = request.payload;
    const payload = {
      content,
      owner,
      threadId
    }

    const addedComment = await addCommentUseCase.execute(payload);
    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    const { commentId } = request.params;
    const { id: owner } = request.auth.credentials;
    const payload = {
      owner,
      commentId
    }
    await deleteCommentUseCase.execute(payload);
    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;
