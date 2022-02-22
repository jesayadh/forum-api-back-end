const RegisteredComment = require('../RegisteredComment');

describe('a RegisteredComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'dicoding',
    };

    // Action and Assert
    expect(() => new RegisteredComment(payload)).toThrowError('REGISTERED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'dicoding',
      owner:{}
    };

    // Action and Assert
    expect(() => new RegisteredComment(payload)).toThrowError('REGISTERED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create registeredComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      content: 'dicoding',
      owner: 'user-123'
    };

    // Action
    const registeredComment = new RegisteredComment(payload);

    // Assert
    expect(registeredComment.id).toEqual(payload.id);
    expect(registeredComment.content).toEqual(payload.content);
    expect(registeredComment.owner).toEqual(payload.owner);
  });
});
