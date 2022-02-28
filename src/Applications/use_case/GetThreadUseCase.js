class GetThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { threadId } = useCasePayload;
    await this._threadRepository.verifyAvailableThread(threadId);
    const thread = await this._dataThread(threadId);

    return thread;
  }

  async _dataThread(threadId){
    const getThread = await this._threadRepository.getThreadById(threadId);
    const getComment = await this._commentRepository.getComments(threadId);
    for(let i=0;i<getComment.length;i++){
      getComment[i].replies = await this._replyRepository.getReplies(getComment[i].id);
    }
    getThread.comments = getComment;
    return getThread;
  }

  _validatePayload(payload) {
    const { threadId } = payload;
    if (!threadId) {
      throw new Error('GET_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
    }

    if (typeof threadId !== 'string') {
      throw new Error('GET_THREAD_USE_CASE.PARAMS_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetThreadUseCase;
