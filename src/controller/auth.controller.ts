import {Request, Response} from "express";
import {getManager} from "typeorm";
import {RegisterValidation} from "../validation/register.validation";
import {User} from "../entity/user.entity";
import bcyptjs from "bcryptjs";
import * as jwt from "jsonwebtoken";
import {sign, verify} from "jsonwebtoken";

export const Register = async (req: Request, res: Response) => {
    const body = req.body;

    const {error} = RegisterValidation.validate(body);
    
    if (error) {
       return res.status(400).send(error.details) 
    }

    if (body.password !== body.password_confirm){
        return res.status(400).send({
            message: "The passwords do not match"
        }); 
    }
    
    const repository = getManager().getRepository(User);

    const {password, ...user} = await repository.save({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        password: await bcyptjs.hash(body.password, 10)
    });

    res.send(user);
}

export const Login = async (req: Request, res:Response) => {
    const repository = getManager().getRepository(User);

    const user = await repository.findOne({email: req.body.email});

    if (!user) {
        return res.status(404).send({
            message: "invalid credetials!"
        })
    }
    
    if (!await bcyptjs.compare(req.body.password, user.password)){
        return res.status(400).send({
            message: "invalid credentials!"
        })
    }

    const token = sign({id:user.id}, process.env.SECRET_KEY);

    res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 Day
    })

    res.send({
        message: "success"
    });
    
}

export const AuthenticatedUser = async (req: Request, res: Response) => {
    const {password, ...user} = req["user"];
    res.send(user);
}

export const Logout = async (req: Request, res: Response) => {
    res.cookie("jwt", "", {maxAge: 0});

    res.send({
        message: "success"
    });
    
}

export const UpdateInfo = async (req: Request, res: Response) => {
    const user =req["user"];

    const repository = getManager().getRepository(User);

    await repository.update(user.id, req.body);

    const {password, ...data} = await repository.findOne(user.id);

    res.send(data);
}

export const UpdatePassword =async (req:Request, res: Response) => {
    const user =req["user"];

    if (req.body.password !== req.body.password_confirm){
        return res.status(400).send({
            message: "The passwords do not match"
        }); 
    }

    const repository = getManager().getRepository(User);

    await repository.update(user.id, {
        password: await bcyptjs.hash(req.body.password, 10)
    });

    const {password, ...data} = user;

    res.send(data);
}