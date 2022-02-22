class RegisterComment {
    constructor(payload,{ threadId, owner }) {
      const { content } = payload;
      this._verifyPayload({ content, threadId, owner });

      this.content = content;
      this.threadId = threadId;
      this.owner = owner;
    }
  
    _verifyPayload({ content, threadId, owner }) {

      if (!content || !threadId || !owner) {
        throw new Error('REGISTER_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
      }

      if (typeof content !== 'string' || typeof threadId !== 'string' || typeof owner !== 'string') {
        throw new Error('REGISTER_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
      }
    }
}
  
module.exports = RegisterComment;
  