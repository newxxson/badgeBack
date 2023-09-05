import  User  from '../../DataBase/User.js'

export default async function godGame(req, res){
    try{
       console.log(req.body);
        const {choice, userId} = req.body;

        const user = await User.findOne({
            where: {id: userId},
        });

        if (!user){
            return res.status(404).json({message: "User not found"});
        }
        //check out whether database has user or not

        const gmChoices = ["rock", "paper", "scissors"];
        const gmChoice = gmChoices[Math.floor(Math.random() * gmChoices.length)];
        //creat gm's random choice

        let result = "tie";
        if (
          (choice === "rock" && gmChoice === "scissors") ||
          (choice === "scissors" && gmChoice === "paper") ||
          (choice === "paper" && gmChoice === "rock")
        ) {
          // User wins
          result = "win";
          // Increase the user's badge by three
          user.getBadge += 3;
        } else if (
          (gmChoice === "rock" && choice === "scissors") ||
          (gmChoice === "scissors" && choice === "paper") ||
          (gmChoice === "paper" && choice === "rock")
        ) {
          // GM wins, or you can handle this separately
          result = "lose";
        }
        
        if (result === "win" || result === "lose") {
            user.godLimit = new Date();
          }
          
          // Save the user's changes to the database
        await user.save();
        return res.status(200).json({ gmChoice, result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
}