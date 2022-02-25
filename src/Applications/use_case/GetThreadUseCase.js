class GetThreadUseCase {
  constructor({
    threadRepository,
  }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { threadId } = useCasePayload;
    await this._threadRepository.checkAvailabilityThread(threadId);
    return this._threadRepository.getThreadById(threadId);
  }

  _validatePayload(payload) {
    const { threadId } = payload;
    if (!threadId) {
      throw new Error('GET_COMMENT_USE_CASE.NOT_CONTAIN_THREAD_ID');
    }

    if (typeof threadId !== 'string') {
      throw new Error('GET_COMMENT_USE_CASE.PARAMS_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetThreadUseCase;
