import { plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsString,
  Length,
  Max,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  validate,
} from 'class-validator';
import { ValidationError } from './errors';

@ValidatorConstraint({ name: 'IsPasswordValid', async: false })
class IsPasswordValid implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    // return (
    //   typeof password === 'string' &&
    //   password.length >= 8 && // min length 8
    //   /[A-Z]/.test(password) && // at least one uppercase letter
    //   /[0-9]/.test(password) && // at least one number
    //   /[!@#$%^&*(),.?":{}|<>]/.test(password) // at least one special character
    // );
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password must be at least 8 characters long, and include at least one uppercase letter, one number, and one special character.';
  }
}

class RegisterInput {
  @IsString()
  @Length(3, 20)
  username: string;

  @IsEmail()
  email: string;

  @Validate(IsPasswordValid)
  password: string;
}

class AddBookInput {
  @IsString()
  @Length(1, 255)
  title: string;

  @IsString()
  @Length(1, 255)
  author: string;

  @IsInt()
  @Min(0)
  publishedYear: number;
}

class AddReviewInput {
  @IsInt()
  bookId: number;

  @IsInt()
  @Min(1)
  @Max(10)
  rating: number;

  @IsString()
  @Length(1, 500)
  comment: string;
}

const validateInput = async (inputClass: any, input: any) => {
  const errors = await validate(plainToInstance(inputClass, input));

  if (errors.length > 0) {
    // Format the error messages
    const messages = errors
      .map((error) => Object.values(error.constraints || {}))
      .flat();
    throw new ValidationError(`Validation failed: ${messages.join(', ')}`);
  }
};

export { AddBookInput, AddReviewInput, RegisterInput, validateInput };
