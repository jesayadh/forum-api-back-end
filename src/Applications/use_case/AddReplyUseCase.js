const RegisterReply = require('../../Domains/replies/entities/RegisterReply');

class AddReplyUseCase {
  constructor({ replyRepository,commentRepository,threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const registerReply = new RegisterReply(useCasePayload);
    await this._threadRepository.verifyAvailableThread(registerReply.threadId);
    await this._commentRepository.verifyAvailableComment(registerReply.commentId);
    return this._replyRepository.addReply(registerReply);
  }
}

module.exports = AddReplyUseCase;
