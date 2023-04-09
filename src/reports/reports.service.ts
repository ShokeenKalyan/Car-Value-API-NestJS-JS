import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { Report } from './report.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Report) private repo: Repository<Report>
    ) {}

    create(reportDto: CreateReportDto, user: User) {
        const report = this.repo.create(reportDto)
        report.user = user // repository is going to extract just the user ID from the entire user entity instance and save that inside reports table
        return this.repo.save(report)
    }

    async changeApproval(id: string, approved: boolean) {
        const report = await this.repo.findOne({ where: { id: parseInt(id) } });
        if (!report) {
            throw new NotFoundException('report not found')
        }

        report.approved = approved
        return this.repo.save(report)
    }

    createEstimate({make, model, lng, lat, year, mileage}: GetEstimateDto) {
        return this.repo.createQueryBuilder()
            .select('AVG(price)', 'price')
            .where('make = :make', {make}) // Equivalent to where('make' = estimateDto.make) // This is considered a secure way to prevent SQL injection exploits
            .andWhere('model = :model', {model}) // If we simply ue where instead of andWhere, it is going to overwrite the existing where condition
            .andWhere('lng - :lng BETWEEN -5 AND 5', {lng})
            .andWhere('lat - :lat BETWEEN -5 AND 5', {lat})
            .andWhere('year - :year BETWEEN -3 AND 3', {year})
            .andWhere('approved IS TRUE')
            .orderBy('ABS(mileage - :mileage)', 'DESC') // orderBy does not take a parameter object as the 2nd argument
            .setParameters({mileage})
            .limit(3)
            .getRawOne()
    }

}
