import { faker } from '@faker-js/faker'
//import { createPassword, createUser } from 'test/db-utils'
import { prisma } from '~/utils/db.server'
//import { deleteAllData } from 'tests/setup/utils'
import fs from 'fs'
import { getPasswordHash } from '~/utils/auth.server'

async function seed() {
	console.log('🌱 Seeding...')
	console.time(`🌱 Database has been seeded`)

	
	const adminRole = await prisma.role.create({
		data: {
			name: 'admin',
			permissions: {
				create: { name: 'admin' },
			},
		},
	})
	console.timeEnd(`👑 Created admin role/permission...`)

	console.time(
		`🐨 Created user and admin role`,
	)
	await prisma.user.create({
		data: {
			email: 'ale@pizza.com',
			username: 'alepizza',
			name: 'Ale Pizza',
			roles: { connect: { id: adminRole.id } },
			image: {
				create: {
					contentType: 'image/jpeg',
					file: {
						create: {
							blob: await fs.promises.readFile(
								'./tests/fixtures/images/user/alepizza.jpeg',
							),
						},
					},
				},
			},
			password: {
				create: {
					hash: await getPasswordHash('123456789'),
				},
			},
			notes: {
				create: [
					{
						title: 'Ale & Thalita Pizza',
						content:
						'Pizzaria e lanchonete com variadede de lanches para você e sua família.',
						latitud: "-22.9301906",
						longitud: "-42.4119475",
						open: "18:00",
						close: "0:30",
						delivery: true,
						phone: "22998856358",
						image: {
							create: {
								contentType: 'image/jpeg',
								file: {
									create: {
										blob: await fs.promises.readFile(
											'./tests/fixtures/images/user/alepizza.jpeg',
										),
									},
								},
							},
						},
						site: "https://app.anota.ai/m/Y7l3fjIJw",
						keywords: {create: [
									{words: "pizza" },
									{words: "lanche"},
									{words: "hamburger"},
									{words:  "delivery"}
						]},
					},
				],
			},
		},
	})

	await prisma.user.create({
		data: {
			email: 'estela@email.com',
			username: 'estela',
			name: 'Estela Santos',
			roles: { connect: { id: adminRole.id } },
			image: {
				create: {
					contentType: 'image/jpeg',
					file: {
						create: {
							blob: await fs.promises.readFile(
								'./tests/fixtures/images/user/estela.jpeg',
							),
						},
					},
				},
			},
			password: {
				create: {
					hash: await getPasswordHash('123456789'),
				},
			},
			notes: {
				create: [
					{
						title: 'Estela Roupas',
						content:
						'Peças de roupas únicas com o melhor preço da região.',
						latitud: "-22.9301906",
						longitud: "-42.4119475",
						open: "9:00",
						close: "20:30",
						delivery: true,
						phone: "21999318689",
						image: {
							create: {
								contentType: 'image/jpeg',
								file: {
									create: {
										blob: await fs.promises.readFile(
											'./tests/fixtures/images/user/estela.jpeg',
										),
									},
								},
							},
						},
						site: "",
						keywords: {create: [
									{words: "roupa" },
									{words: "moda"},
									{words: "feminino"},
									{words:  "delivery"}
						]},
					},
				],
			},
		},
	})
	await prisma.user.create({
		data: {
			email: 'delicias@vila.com',
			username: 'delicias',
			name: 'Delicias Vila',
			roles: { connect: { id: adminRole.id } },
			image: {
				create: {
					contentType: 'image/jpeg',
					file: {
						create: {
							blob: await fs.promises.readFile(
								'./tests/fixtures/images/user/delicias.jpeg',
							),
						},
					},
				},
			},
			password: {
				create: {
					hash: await getPasswordHash('123456789'),
				},
			},
			notes: {
				create: [
					{
						title: 'Delícias da Vila',
						content:
						'Salgados especiais e recheados, pratos cazeiros e típicos da região, múltiplas opções para todos.',
						latitud: "-22.9301906",
						longitud: "-42.4119475",
						open: "9:00",
						close: "18:00",
						delivery: true,
						phone: "22997997690",
            			image: {
							create: {
								contentType: 'image/jpeg',
								file: {
									create: {
										blob: await fs.promises.readFile(
											'./tests/fixtures/images/user/delicias.jpeg',
										),
									},
								},
							},
						},
						site: "https://deliciasdavila.ola.click/products",
						keywords: {create: [
							{words: "salgado" },
							{words: "lanche"},
							{words: "almoço"},
							{words:  "delivery"}
						]},
					},
				],
			},
		},
	})
	await prisma.user.create({
		data: {
			email: 'rancho@cigarras.com',
			username: 'rancho',
			name: 'Rancho Cigarras',
			roles: { connect: { id: adminRole.id } },
			image: {
				create: {
					contentType: 'image/jpeg',
					file: {
						create: {
							blob: await fs.promises.readFile(
								'./tests/fixtures/images/user/rancho.jpeg',
							),
						},
					},
				},
			},
			password: {
				create: {
					hash: await getPasswordHash('123456789'),
				},
			},
			notes: {
				create: [
					{
						title: 'Rancho das Cigarras',
						content:
						'Ambiente familiar com comida típica mineira e muitas atrações para as crianças.',
						latitud: "-22.8988856",
						longitud: "-42.4406357",
						open: "9:00",
						close: "20:00",
						delivery: true,
						phone: "22998872392",
            			image: {
							create: {
								contentType: 'image/jpeg',
								file: {
									create: {
										blob: await fs.promises.readFile(
											'./tests/fixtures/images/user/rancho.jpeg',
										),
									},
								},
							},
						},
						site: "https://www.facebook.com/ranchodascigarras/",
						keywords: {create: [
							{words: "almoço" },
							{words: "comida"},
							{words: "queijos"},
							{words: "crianças"},
							{words: "criança"},
							{words: "delivery"},
						]},
					},
				],
			},
		},
	})
	console.timeEnd(
		`🐨 Created users`,
	)

	console.timeEnd(`🌱 Database has been seeded`)
}

seed()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

/*
eslint
	@typescript-eslint/no-unused-vars: "off",
*/
