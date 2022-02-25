const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const { threadId,commentId } = request.params;
    const { id: owner } = request.auth.credentials;
    const { content } = request.payload;
    const payload = {
      content,
      owner,
      threadId,
      commentId
    }

    const addedReply = await addReplyUseCase.execute(payload);
    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request) {
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    const { replyId } = request.params;
    const { id: owner } = request.auth.credentials;
    const payload = {
      owner,
      replyId
    }
    await deleteReplyUseCase.execute(payload);
    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;
