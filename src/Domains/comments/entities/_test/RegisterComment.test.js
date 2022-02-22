const RegisterComment = require('../RegisterComment');

describe('a RegisterComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'abc',
      threadId: 'thread-123',
    };
    // Action and Assert
    expect(() => new RegisterComment(payload)).toThrowError('REGISTER_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
      threadId: {},
      owner: {},
    };

    // Action and Assert
    expect(() => new RegisterComment(payload)).toThrowError('REGISTER_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create registerComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'dicoding',
      threadId: 'thread-123',
      owner: 'user-123'
    };

    // Action
    const { content, threadId, owner } = new RegisterComment(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(threadId).toEqual(payload.threadId);
    expect(owner).toEqual(payload.owner);
  });
});
