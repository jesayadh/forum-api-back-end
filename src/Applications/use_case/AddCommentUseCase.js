const RegisterComment = require('../../Domains/comments/entities/RegisterComment');

class AddCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const registerComment = new RegisterComment(useCasePayload);
    await this._commentRepository.verifyAvailableThread(registerComment.threadId);
    return this._commentRepository.addComment(registerComment);
  }
}

module.exports = AddCommentUseCase;
