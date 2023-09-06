import PhoneNum from "../../DataBase/PhoneNum.js";
import User from "../../DataBase/User.js";

export async function phoneNum(req, res, userId) {
  try {
    console.log(req);
    const { phoneNum } = req.body;
    const user = await User.findOne({
      where: { userId: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.getBadge < 15) {
      return res.status(400).json({ message: "not enough getBadge" });
    }
    //check out whether user in database or not

    const [phoneNumRecord, uncreated] = await PhoneNum.findOrCreate({
      where: { userId: user.userId },
      defaults: { phoneNum: phoneNum },
    });

    if (!uncreated) {
      // If the record already existed, update the phoneNum.
      phoneNumRecord.phoneNum = phoneNum;
      phoneNumRecord.amount += 1;
      user.getBadge -= 15;

      await user.save();
      await phoneNumRecord.save();
      return res
        .status(200)
        .json({ message: "Phone number updated successfully" });
    } else {
      return res
        .status(201)
        .json({ message: "Phone number created successfully" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getPhoneNumAmount(req, res, userId) {
  try {
    const phoneNum = await PhoneNum.findByPk(userId);
    if (phoneNum) {
      return res.status(200).json({ amount: phoneNum.amount });
    } else {
      return res.status(200).json({ amount: 0 });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
