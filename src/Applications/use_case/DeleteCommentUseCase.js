class DeleteCommentUseCase {
  constructor({
    commentRepository,
    threadRepository
  }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { owner,commentId } = useCasePayload;
    await this._commentRepository.checkAvailabilityComment(commentId);
    await this._commentRepository.verifyCommentOwner(commentId,owner);
    await this._commentRepository.deleteComment(commentId);
  }

  _validatePayload(payload) {
    const { commentId } = payload;
    if (!commentId) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN');
    }

    if (typeof commentId !== 'string') {
      throw new Error('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteCommentUseCase;
