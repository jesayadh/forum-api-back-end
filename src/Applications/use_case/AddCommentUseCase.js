const RegisterComment = require('../../Domains/comments/entities/RegisterComment');

class AddCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload,{threadId,owner}) {
    const registerComment = new RegisterComment(useCasePayload,{threadId,owner});
    return this._commentRepository.addComment(registerComment);
  }
}

module.exports = AddCommentUseCase;
