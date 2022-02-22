const RegisterComment = require('../../Domains/comments/entities/RegisterComment');

class AddCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const registerComment = new RegisterComment(useCasePayload);
    return this._commentRepository.addComment(registerComment);
  }
}

module.exports = AddCommentUseCase;
